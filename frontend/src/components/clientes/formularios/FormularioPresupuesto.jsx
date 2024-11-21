import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useClientes } from "../../../context/ClientesContext";
import { useProductos } from "../../../context/ProductosContext";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import styled from "styled-components";
import Select from "react-select";

const FormularioPresupuesto = ({ clienteId, onClose }) => {
  const { createQuote } = useClientes();
  const { productos, getProductos } = useProductos();
  const [items, setItems] = useState([]);
  const [procesando, setProcesando] = useState(false);
  const [productosOptions, setProductosOptions] = useState([]);

  useEffect(() => {
    const loadProductos = async () => {
      await getProductos();
    };
    loadProductos();
  }, []);

  useEffect(() => {
    const options = productos.map((prod) => ({
      value: prod._id,
      label: `${prod.name}`,
      product: prod,
    }));
    setProductosOptions(options);
  }, [productos]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      observation: "",
    },
  });

  const addItem = () => {
    setItems([
      ...items,
      {
        productId: null,
        description: "",
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        subtotal: 0,
      },
    ]);
  };

  const handleProductSelect = (selectedOption, index) => {
    if (selectedOption) {
      const product = selectedOption.product;
      updateItem(index, "productId", product._id);
      updateItem(index, "description", product.name);
      updateItem(index, "unitPrice", product.price);
    }
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    const item = newItems[index];
    const subtotal = item.quantity * item.unitPrice * (1 - item.discount / 100);
    newItems[index].subtotal = subtotal;

    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.subtotal, 0);
  };

  const onSubmit = async (data) => {
    if (items.length === 0) {
      toast.error("Debe agregar al menos un ítem al presupuesto");
      return;
    }

    const loadingToast = toast.loading("Procesando presupuesto...");
    setProcesando(true);

    try {
      const presupuestoData = {
        ...data,
        items: items.map((item) => ({
          ...item,
          subtotal: item.subtotal,
        })),
        total: calculateTotal(),
      };

      const response = await createQuote(clienteId, presupuestoData);
      toast.success("Presupuesto creado exitosamente");
      reset();
      setItems([]);
      onClose();
    } catch (error) {
      console.error("Error al crear presupuesto:", error);
      toast.error(
        error.response?.data?.message || "Error al crear el presupuesto"
      );
    } finally {
      setProcesando(false);
      toast.dismiss(loadingToast);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit(onSubmit)}>
      <FormGrid>
        {/* Sección de Encabezado */}
        <FormSection>
          <SectionTitle>Información General</SectionTitle>
          <FormRow>
            <FormGroup>
              <Label>Fecha</Label>
              <Controller
                name="date"
                control={control}
                rules={{ required: "La fecha es requerida" }}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <Input type="date" {...field} error={error} />
                    {error && <ErrorText>{error.message}</ErrorText>}
                  </>
                )}
              />
            </FormGroup>

            <FormGroup>
              <Label>Válido Hasta</Label>
              <Controller
                name="validUntil"
                control={control}
                rules={{ required: "La fecha de validez es requerida" }}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <Input type="date" {...field} error={error} />
                    {error && <ErrorText>{error.message}</ErrorText>}
                  </>
                )}
              />
            </FormGroup>
          </FormRow>
        </FormSection>

        {/* Sección de Items */}
        <FormSection>
          <div className="flex justify-between items-center mb-4">
            <SectionTitle>Detalle de Items</SectionTitle>
            <AddButton type="button" onClick={addItem}>
              <Plus size={20} />
              Agregar Ítem
            </AddButton>
          </div>

          <ItemsContainer>
            {items.map((item, index) => (
              <ItemRow key={index}>
                <FormGroup flex={2}>
                  <Select
                    options={productosOptions}
                    onChange={(option) => handleProductSelect(option, index)}
                    placeholder="Seleccionar producto..."
                    className="basic-single capitalize"
                    classNamePrefix="select"
                    isClearable={true}
                    isSearchable={true}
                    noOptionsMessage={() => "No hay productos"}
                  />
                </FormGroup>

                <FormGroup>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Cantidad"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", parseFloat(e.target.value))
                    }
                  />
                </FormGroup>

                <FormGroup>
                  <Input
                    type="number"
                    placeholder="Precio"
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateItem(index, "unitPrice", parseFloat(e.target.value))
                    }
                  />
                </FormGroup>

                <FormGroup>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="%"
                    value={item.discount}
                    onChange={(e) =>
                      updateItem(index, "discount", parseFloat(e.target.value))
                    }
                  />
                </FormGroup>

                <FormGroup>
                  <Input
                    type="text"
                    value={`$${item.subtotal.toLocaleString()}`}
                    readOnly
                    className="text-right"
                  />
                </FormGroup>

                <DeleteButton
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                >
                  <Trash2 size={20} />
                </DeleteButton>
              </ItemRow>
            ))}
          </ItemsContainer>

          <TotalesSection>
            <TotalRow>
              <TotalLabel>Total</TotalLabel>
              <TotalValue>${calculateTotal().toLocaleString()}</TotalValue>
            </TotalRow>
          </TotalesSection>
        </FormSection>

        {/* Sección de Observaciones */}
        <FormSection>
          <SectionTitle>Observaciones</SectionTitle>
          <FormGroup>
            <Controller
              name="observation"
              control={control}
              render={({ field }) => <TextArea rows={3} {...field} />}
            />
          </FormGroup>
        </FormSection>

        {/* Botones */}
        <ButtonContainer>
          <CancelButton type="button" onClick={onClose}>
            Cancelar
          </CancelButton>
          <SubmitButton type="submit" disabled={procesando}>
            {procesando ? "Guardando..." : "Guardar Presupuesto"}
          </SubmitButton>
        </ButtonContainer>
      </FormGrid>
    </FormContainer>
  );
};

// Estilos
const FormContainer = styled.form`
  padding: 1.5rem;
`;

const FormGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: ${(props) => props.flex || 1};
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const Input = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid ${(props) => (props.error ? "#EF4444" : "#D1D5DB")};
  border-radius: 4px;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }

  &:read-only {
    background-color: #f3f4f6;
  }
`;

const TextArea = styled.textarea`
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
`;

const CancelButton = styled(Button)`
  background-color: #f3f4f6;
  color: #374151;
  &:hover {
    background-color: #e5e7eb;
  }
`;

const SubmitButton = styled(Button)`
  background-color: #3b82f6;
  color: white;
  &:hover:not(:disabled) {
    background-color: #2563eb;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
`;

const ItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ItemRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto;
  gap: 1rem;
  align-items: flex-end;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
`;

const DeleteButton = styled.button`
  padding: 0.5rem;
  color: #ef4444;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};

  &:hover:not(:disabled) {
    color: #dc2626;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #3b82f6;
  font-weight: 500;
  padding: 0.5rem;

  &:hover {
    color: #2563eb;
  }
`;

const TotalesSection = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  background-color: #f9fafb;
  margin-top: 1rem;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
`;

const TotalLabel = styled.span`
  color: #374151;
  font-weight: 500;
`;

const TotalValue = styled.span`
  color: #111827;
  font-weight: 500;
`;

export default FormularioPresupuesto;
