import { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useClientes } from "../../../context/ClientesContext";
import { Plus, Trash2 } from "lucide-react";
import styled from "styled-components";
import toast from "react-hot-toast";

const FormularioNotaDebCred = ({ clienteId, onClose, nota = null }) => {
  const { TIPOS_NOTA, crearNotaDebCred, obtenerFacturasCliente } =
    useClientes();
  const [facturasDisponibles, setFacturasDisponibles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      noteType: nota?.noteType || "",
      noteNumber: nota?.noteNumber || "",
      date: nota?.date?.split("T")[0] || new Date().toISOString().split("T")[0],
      relatedInvoice: nota?.relatedInvoice || "",
      items: nota?.items || [
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          subtotal: 0,
        },
      ],
      observation: nota?.observation || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    const cargarFacturas = async () => {
      try {
        const facturas = await obtenerFacturasCliente(clienteId);
        setFacturasDisponibles(facturas);
      } catch (error) {
        console.error("Error al cargar facturas:", error);
        toast.error("Error al cargar facturas disponibles");
      }
    };
    cargarFacturas();
  }, [clienteId]);

  // Observar cambios en items para calcular totales
  const items = watch("items");
  const total = items.reduce((acc, item) => {
    const subtotal = item.quantity * item.unitPrice * (1 - item.discount / 100);
    return acc + (subtotal || 0);
  }, 0);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await crearNotaDebCred(clienteId, {
        ...data,
        total: Math.round(total * 100) / 100,
      });
      toast.success("Nota creada exitosamente");
      onClose();
    } catch (error) {
      console.error("Error al crear nota:", error);
      toast.error("Error al crear la nota");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit(onSubmit)}>
      <FormGrid>
        {/* Encabezado */}
        <FormSection>
          <FormRow>
            <FormGroup>
              <Label>Tipo de Nota</Label>
              <Controller
                name="noteType"
                control={control}
                rules={{ required: "El tipo es requerido" }}
                render={({ field }) => (
                  <Select {...field}>
                    <option value="">Seleccionar...</option>
                    {TIPOS_NOTA.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </Select>
                )}
              />
              {errors.noteType && (
                <ErrorText>{errors.noteType.message}</ErrorText>
              )}
            </FormGroup>

            <FormGroup>
              <Label>Número</Label>
              <Controller
                name="noteNumber"
                control={control}
                rules={{ required: "El número es requerido" }}
                render={({ field }) => <Input {...field} />}
              />
              {errors.noteNumber && (
                <ErrorText>{errors.noteNumber.message}</ErrorText>
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
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>Factura Relacionada</Label>
              <Controller
                name="relatedInvoice"
                control={control}
                rules={{ required: "La factura es requerida" }}
                render={({ field }) => (
                  <Select {...field}>
                    <option value="">Seleccionar...</option>
                    {facturasDisponibles.map((factura) => (
                      <option key={factura._id} value={factura._id}>
                        Factura #{factura.invoiceNumber}
                      </option>
                    ))}
                  </Select>
                )}
              />
              {errors.relatedInvoice && (
                <ErrorText>{errors.relatedInvoice.message}</ErrorText>
              )}
            </FormGroup>
          </FormRow>
        </FormSection>

        {/* Items */}
        <FormSection>
          <div className="flex justify-between items-center mb-4">
            <SectionTitle>Items</SectionTitle>
            <AddButton
              type="button"
              onClick={() =>
                append({
                  description: "",
                  quantity: 1,
                  unitPrice: 0,
                  discount: 0,
                  subtotal: 0,
                })
              }
            >
              <Plus size={20} />
              Agregar Item
            </AddButton>
          </div>

          <ItemsContainer>
            {fields.map((field, index) => (
              <ItemRow key={field.id}>
                <FormGroup flex="2">
                  <Label>Descripción</Label>
                  <Controller
                    name={`items.${index}.description`}
                    control={control}
                    rules={{ required: "La descripción es requerida" }}
                    render={({ field }) => <Input {...field} />}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Cantidad</Label>
                  <Controller
                    name={`items.${index}.quantity`}
                    control={control}
                    rules={{ required: "La cantidad es requerida", min: 1 }}
                    render={({ field }) => (
                      <Input type="number" min="1" step="1" {...field} />
                    )}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Precio Unit.</Label>
                  <Controller
                    name={`items.${index}.unitPrice`}
                    control={control}
                    rules={{ required: "El precio es requerido", min: 0 }}
                    render={({ field }) => (
                      <Input type="number" min="0" step="0.01" {...field} />
                    )}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Desc. %</Label>
                  <Controller
                    name={`items.${index}.discount`}
                    control={control}
                    render={({ field }) => (
                      <Input type="number" min="0" max="100" {...field} />
                    )}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Subtotal</Label>
                  <Input
                    type="number"
                    value={
                      Math.round(
                        watch(`items.${index}.quantity`) *
                          watch(`items.${index}.unitPrice`) *
                          (1 - watch(`items.${index}.discount`) / 100) *
                          100
                      ) / 100
                    }
                    readOnly
                    className="bg-gray-100"
                  />
                </FormGroup>

                <DeleteButton
                  type="button"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 size={20} />
                </DeleteButton>
              </ItemRow>
            ))}
          </ItemsContainer>
        </FormSection>

        {/* Totales y Observaciones */}
        <FormSection>
          <FormRow>
            <FormGroup flex="2">
              <Label>Observaciones</Label>
              <Controller
                name="observation"
                control={control}
                render={({ field }) => <TextArea rows="3" {...field} />}
              />
            </FormGroup>
            <FormGroup>
              <Label>Total</Label>
              <Input
                type="number"
                value={Math.round(total * 100) / 100}
                readOnly
                className="bg-gray-100 text-right"
              />
            </FormGroup>
          </FormRow>
        </FormSection>
      </FormGrid>

      <ButtonContainer>
        <CancelButton type="button" onClick={onClose}>
          Cancelar
        </CancelButton>
        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : "Guardar Nota"}
        </SubmitButton>
      </ButtonContainer>
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

export default FormularioNotaDebCred;
