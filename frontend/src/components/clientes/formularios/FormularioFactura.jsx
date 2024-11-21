import { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useClientes } from "../../../context/ClientesContext";
import { useProductos } from "../../../context/ProductosContext";
import { Plus, Trash2, X } from "lucide-react";
import styled from "styled-components";

const FormularioFactura = ({ clienteId, onClose, factura = null }) => {
  const { createFactura, TIPOS_FACTURA, METODOS_PAGO } = useClientes();
  const { productos, getProductos } = useProductos();
  const [calculando, setCalculando] = useState(false);

  useEffect(() => {
    getProductos();
  }, []);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      invoiceType: factura?.invoiceType || "A",
      date:
        factura?.date?.split("T")[0] || new Date().toISOString().split("T")[0],
      dueDate: factura?.dueDate?.split("T")[0] || "",
      paymentMethod: factura?.paymentMethod || "EFECTIVO",
      items: factura?.items || [
        {
          product: "",
          description: "",
          quantity: 1,
          unitPrice: 0,
          taxRate: 21,
        },
      ],
      observation: factura?.observation || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // Observar cambios en items para calcular totales
  const items = watch("items");
  const subtotal = items.reduce((acc, item) => {
    return acc + (item.quantity * item.unitPrice || 0);
  }, 0);

  const iva = items.reduce((acc, item) => {
    return acc + (item.quantity * item.unitPrice * (item.taxRate / 100) || 0);
  }, 0);

  const total = subtotal + iva;

  const handleProductChange = (index, productId) => {
    const producto = productos.find((p) => p._id === productId);
    if (producto) {
      setValue(`items.${index}.description`, producto.description);
      setValue(`items.${index}.unitPrice`, producto.price);
      setValue(`items.${index}.taxRate`, 21); // IVA por defecto
    }
  };

  const onSubmit = async (data) => {
    try {
      setCalculando(true);
      const response = await createFactura(clienteId, {
        ...data,
        subtotal,
        iva,
        total,
      });

      if (response.success) {
        onClose();
      }
    } finally {
      setCalculando(false);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit(onSubmit)}>
      <FormGrid>
        {/* Encabezado */}
        <FormSection>
          <FormRow>
            <FormGroup>
              <Label>Tipo de Factura</Label>
              <Controller
                name="invoiceType"
                control={control}
                rules={{ required: "El tipo es requerido" }}
                render={({ field }) => (
                  <Select {...field}>
                    {TIPOS_FACTURA.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </Select>
                )}
              />
              {errors.invoiceType && (
                <ErrorText>{errors.invoiceType.message}</ErrorText>
              )}
            </FormGroup>

            <FormGroup>
              <Label>Fecha</Label>
              <Controller
                name="date"
                control={control}
                rules={{ required: "La fecha es requerida" }}
                render={({ field }) => <Input type="date" {...field} />}
              />
              {errors.date && <ErrorText>{errors.date.message}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>Vencimiento</Label>
              <Controller
                name="dueDate"
                control={control}
                render={({ field }) => <Input type="date" {...field} />}
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>Método de Pago</Label>
              <Controller
                name="paymentMethod"
                control={control}
                rules={{ required: "El método de pago es requerido" }}
                render={({ field }) => (
                  <Select {...field}>
                    {METODOS_PAGO.map((metodo) => (
                      <option key={metodo.value} value={metodo.value}>
                        {metodo.label}
                      </option>
                    ))}
                  </Select>
                )}
              />
            </FormGroup>
          </FormRow>
        </FormSection>

        {/* Items */}
        <FormSection>
          <SectionTitle>Items</SectionTitle>
          <ItemsContainer>
            {fields.map((field, index) => (
              <ItemRow key={field.id}>
                <FormGroup flex="2">
                  <Label>Producto</Label>
                  <Controller
                    name={`items.${index}.product`}
                    control={control}
                    rules={{ required: "El producto es requerido" }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleProductChange(index, e.target.value);
                        }}
                      >
                        <option value="">Seleccionar producto</option>
                        {productos.map((producto) => (
                          <option key={producto._id} value={producto._id}>
                            {producto.name}
                          </option>
                        ))}
                      </Select>
                    )}
                  />
                </FormGroup>

                <FormGroup flex="2">
                  <Label>Descripción</Label>
                  <Controller
                    name={`items.${index}.description`}
                    control={control}
                    render={({ field }) => <Input {...field} />}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Cantidad</Label>
                  <Controller
                    name={`items.${index}.quantity`}
                    control={control}
                    rules={{
                      required: "Requerido",
                      min: { value: 1, message: "Mínimo 1" },
                    }}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    )}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Precio Unit.</Label>
                  <Controller
                    name={`items.${index}.unitPrice`}
                    control={control}
                    rules={{
                      required: "Requerido",
                      min: { value: 0, message: "Mínimo 0" },
                    }}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    )}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>IVA %</Label>
                  <Controller
                    name={`items.${index}.taxRate`}
                    control={control}
                    rules={{ required: "Requerido" }}
                    render={({ field }) => (
                      <Select {...field}>
                        <option value="0">0%</option>
                        <option value="10.5">10.5%</option>
                        <option value="21">21%</option>
                        <option value="27">27%</option>
                      </Select>
                    )}
                  />
                </FormGroup>

                <DeleteButton
                  type="button"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 size={18} />
                </DeleteButton>
              </ItemRow>
            ))}
          </ItemsContainer>

          <AddButton
            type="button"
            onClick={() =>
              append({
                product: "",
                description: "",
                quantity: 1,
                unitPrice: 0,
                taxRate: 21,
              })
            }
          >
            <Plus size={20} />
            Agregar Item
          </AddButton>
        </FormSection>

        {/* Totales */}
        <TotalesSection>
          <TotalRow>
            <TotalLabel>Subtotal:</TotalLabel>
            <TotalValue>${subtotal.toLocaleString()}</TotalValue>
          </TotalRow>
          <TotalRow>
            <TotalLabel>IVA:</TotalLabel>
            <TotalValue>${iva.toLocaleString()}</TotalValue>
          </TotalRow>
          <TotalRow>
            <TotalLabel>Total:</TotalLabel>
            <TotalValue className="text-lg font-bold">
              ${total.toLocaleString()}
            </TotalValue>
          </TotalRow>
        </TotalesSection>

        {/* Observaciones */}
        <FormSection>
          <FormGroup>
            <Label>Observaciones</Label>
            <Controller
              name="observation"
              control={control}
              render={({ field }) => <TextArea {...field} rows={3} />}
            />
          </FormGroup>
        </FormSection>
      </FormGrid>

      <ButtonContainer>
        <CancelButton type="button" onClick={onClose}>
          Cancelar
        </CancelButton>
        <SubmitButton type="submit" disabled={calculando}>
          {calculando ? "Procesando..." : "Crear Factura"}
        </SubmitButton>
      </ButtonContainer>
    </FormContainer>
  );
};

// Estilos base
const FormContainer = styled.form`
  width: 100%;
`;

const FormGrid = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const FormSection = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
`;

const Select = styled.select`
  padding: 0.5rem 0.75rem;
  border: 1px solid ${(props) => (props.error ? "#EF4444" : "#D1D5DB")};
  border-radius: 4px;
  background-color: white;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }
`;

const TextArea = styled.textarea`
  padding: 0.5rem 0.75rem;
  border: 1px solid ${(props) => (props.error ? "#EF4444" : "#D1D5DB")};
  border-radius: 4px;
  min-height: 80px;
  font-size: 0.875rem;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }
`;

const ErrorText = styled.span`
  color: #ef4444;
  font-size: 0.75rem;
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
  margin-bottom: 1rem;
`;

const ItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ItemRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 2fr 1fr 1fr 1fr auto;
  gap: 1rem;
  align-items: flex-end;
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
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;

  &:not(:last-child) {
    border-bottom: 1px solid #e5e7eb;
  }
`;

const TotalLabel = styled.span`
  color: #374151;
  font-weight: 500;
`;

const TotalValue = styled.span`
  color: #111827;
  font-weight: 500;
`;

export default FormularioFactura;
