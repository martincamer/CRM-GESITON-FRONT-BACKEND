import { useForm, Controller } from "react-hook-form";
import { useClientes } from "../../context/ClientesContext";
import styled from "styled-components";
import { toast } from "react-hot-toast";

const FormularioCliente = ({ onClose, cliente = null }) => {
  const {
    createCliente,
    updateCliente,
    TIPOS_DOCUMENTO,
    CONDICIONES_FISCALES,
  } = useClientes();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      businessName: cliente?.businessName || "",
      fantasyName: cliente?.fantasyName || "",
      documentType: cliente?.documentType || "",
      documentNumber: cliente?.documentNumber || "",
      taxCondition: cliente?.taxCondition || "",
      contact: {
        email: cliente?.contact?.email || "",
        phone: cliente?.contact?.phone || "",
        alternativePhone: cliente?.contact?.alternativePhone || "",
      },
      address: {
        street: cliente?.address?.street || "",
        number: cliente?.address?.number || "",
        floor: cliente?.address?.floor || "",
        apartment: cliente?.address?.apartment || "",
        city: cliente?.address?.city || "",
        state: cliente?.address?.state || "",
        zipCode: cliente?.address?.zipCode || "",
      },
      paymentInfo: {
        creditLimit: cliente?.paymentInfo?.creditLimit || 0,
        defaultDueDays: cliente?.paymentInfo?.defaultDueDays || 0,
      },
      isActive: cliente?.isActive ?? true,
    },
  });

  const onSubmit = async (data) => {
    try {
      const formattedData = {
        ...data,
        paymentInfo: {
          ...data.paymentInfo,
          creditLimit: Number(data.paymentInfo.creditLimit),
          defaultDueDays: Number(data.paymentInfo.defaultDueDays),
        },
      };

      const response = cliente
        ? await updateCliente(cliente._id, formattedData)
        : await createCliente(formattedData);

      if (response.success) {
        toast.success(
          cliente
            ? "Cliente actualizado exitosamente"
            : "Cliente creado exitosamente"
        );
        onClose();
      } else {
        if (response.errors) {
          Object.keys(response.errors).forEach((field) => {
            setError(field, {
              type: "server",
              message: response.errors[field].message,
            });
          });
        } else {
          toast.error(response.message || "Error al procesar el formulario");
        }
      }
    } catch (error) {
      console.error("Error en submit:", error);
      toast.error("Error al procesar el formulario");
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit(onSubmit)}>
      <FormGrid>
        {/* Información básica */}
        <FormSection>
          <SectionTitle>Información Básica</SectionTitle>
          <FormRow>
            <FormGroup>
              <Label>Razón Social</Label>
              <Controller
                name="businessName"
                control={control}
                rules={{
                  required: "La razón social es obligatoria",
                  minLength: {
                    value: 3,
                    message: "Mínimo 3 caracteres",
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    error={errors.businessName}
                    placeholder="Razón social"
                  />
                )}
              />
              {errors.businessName && (
                <ErrorText>{errors.businessName.message}</ErrorText>
              )}
            </FormGroup>

            <FormGroup>
              <Label>Nombre de Fantasía</Label>
              <Controller
                name="fantasyName"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Nombre de fantasía" />
                )}
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>Tipo de Documento</Label>
              <Controller
                name="documentType"
                control={control}
                rules={{ required: "El tipo de documento es obligatorio" }}
                render={({ field }) => (
                  <Select {...field} error={errors.documentType}>
                    <option value="">Seleccionar tipo</option>
                    {TIPOS_DOCUMENTO.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </Select>
                )}
              />
              {errors.documentType && (
                <ErrorText>{errors.documentType.message}</ErrorText>
              )}
            </FormGroup>

            <FormGroup>
              <Label>Número de Documento</Label>
              <Controller
                name="documentNumber"
                control={control}
                rules={{
                  required: "El número de documento es obligatorio",
                  pattern: {
                    value: /^\d{8,11}$/,
                    message: "Formato de documento inválido",
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    error={errors.documentNumber}
                    placeholder="Número de documento"
                  />
                )}
              />
              {errors.documentNumber && (
                <ErrorText>{errors.documentNumber.message}</ErrorText>
              )}
            </FormGroup>

            <FormGroup>
              <Label>Condición Fiscal</Label>
              <Controller
                name="taxCondition"
                control={control}
                rules={{ required: "La condición fiscal es obligatoria" }}
                render={({ field }) => (
                  <Select {...field} error={errors.taxCondition}>
                    <option value="">Seleccionar condición</option>
                    {CONDICIONES_FISCALES.map((condicion) => (
                      <option key={condicion.value} value={condicion.value}>
                        {condicion.label}
                      </option>
                    ))}
                  </Select>
                )}
              />
              {errors.taxCondition && (
                <ErrorText>{errors.taxCondition.message}</ErrorText>
              )}
            </FormGroup>
          </FormRow>
        </FormSection>

        {/* Contacto */}
        <FormSection>
          <SectionTitle>Información de Contacto</SectionTitle>
          <FormRow>
            <FormGroup>
              <Label>Email</Label>
              <Controller
                name="contact.email"
                control={control}
                rules={{
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email inválido",
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="email"
                    error={errors.contact?.email}
                    placeholder="Email"
                  />
                )}
              />
              {errors.contact?.email && (
                <ErrorText>{errors.contact.email.message}</ErrorText>
              )}
            </FormGroup>

            <FormGroup>
              <Label>Teléfono</Label>
              <Controller
                name="contact.phone"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Teléfono principal" />
                )}
              />
            </FormGroup>

            <FormGroup>
              <Label>Teléfono Alternativo</Label>
              <Controller
                name="contact.alternativePhone"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Teléfono alternativo" />
                )}
              />
            </FormGroup>
          </FormRow>
        </FormSection>

        {/* Dirección */}
        <FormSection>
          <SectionTitle>Dirección</SectionTitle>
          <FormRow>
            <FormGroup>
              <Label>Calle</Label>
              <Controller
                name="address.street"
                control={control}
                render={({ field }) => <Input {...field} placeholder="Calle" />}
              />
            </FormGroup>

            <FormGroup>
              <Label>Número</Label>
              <Controller
                name="address.number"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Número" />
                )}
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>Piso</Label>
              <Controller
                name="address.floor"
                control={control}
                render={({ field }) => <Input {...field} placeholder="Piso" />}
              />
            </FormGroup>

            <FormGroup>
              <Label>Departamento</Label>
              <Controller
                name="address.apartment"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Departamento" />
                )}
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>Ciudad</Label>
              <Controller
                name="address.city"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Ciudad" />
                )}
              />
            </FormGroup>

            <FormGroup>
              <Label>Provincia</Label>
              <Controller
                name="address.state"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Provincia" />
                )}
              />
            </FormGroup>

            <FormGroup>
              <Label>Código Postal</Label>
              <Controller
                name="address.zipCode"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Código postal" />
                )}
              />
            </FormGroup>
          </FormRow>
        </FormSection>

        {/* Información de pago */}
        <FormSection>
          <SectionTitle>Información de Pago</SectionTitle>
          <FormRow>
            <FormGroup>
              <Label>Límite de Crédito</Label>
              <Controller
                name="paymentInfo.creditLimit"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Límite de crédito"
                  />
                )}
              />
            </FormGroup>

            <FormGroup>
              <Label>Días de Vencimiento</Label>
              <Controller
                name="paymentInfo.defaultDueDays"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    placeholder="Días de vencimiento"
                  />
                )}
              />
            </FormGroup>
          </FormRow>
        </FormSection>

        {/* Estado */}
        <FormGroup>
          <CheckboxContainer>
            <Controller
              name="isActive"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Checkbox
                  type="checkbox"
                  checked={value}
                  onChange={(e) => onChange(e.target.checked)}
                />
              )}
            />
            <CheckboxLabel>Cliente activo</CheckboxLabel>
          </CheckboxContainer>
        </FormGroup>
      </FormGrid>

      <ButtonContainer>
        <CancelButton type="button" onClick={onClose}>
          Cancelar
        </CancelButton>
        <SubmitButton type="submit">
          {cliente ? "Actualizar" : "Crear"} Cliente
        </SubmitButton>
      </ButtonContainer>
    </FormContainer>
  );
};

// Estilos (igual que en FormularioProducto pero con algunas adiciones)
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

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
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
  width: 100%;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Select = styled.select`
  padding: 0.5rem 0.75rem;
  border: 1px solid ${(props) => (props.error ? "#EF4444" : "#D1D5DB")};
  border-radius: 4px;
  width: 100%;
  background-color: white;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const Checkbox = styled.input`
  width: 1rem;
  height: 1rem;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  cursor: pointer;

  &:checked {
    background-color: #3b82f6;
    border-color: #3b82f6;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #93c5fd;
  }
`;

const CheckboxLabel = styled.label`
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 4px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #93c5fd;
  }
`;

const CancelButton = styled(Button)`
  color: #374151;
  background-color: white;
  border: 1px solid #d1d5db;

  &:hover {
    background-color: #f3f4f6;
  }
`;

const SubmitButton = styled(Button)`
  color: white;
  background-color: #3b82f6;
  border: 1px solid transparent;

  &:hover {
    background-color: #2563eb;
  }

  &:disabled {
    background-color: #93c5fd;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.span`
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: -0.25rem;
`;

const TextArea = styled.textarea`
  padding: 0.5rem 0.75rem;
  border: 1px solid ${(props) => (props.error ? "#EF4444" : "#D1D5DB")};
  border-radius: 4px;
  width: 100%;
  resize: vertical;
  min-height: 80px;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Hint = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const RequiredMark = styled.span`
  color: #ef4444;
  margin-left: 0.25rem;
`;

const InputGroup = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputPrefix = styled.span`
  position: absolute;
  left: 0.75rem;
  color: #6b7280;
  font-size: 0.875rem;
`;

const InputWithPrefix = styled(Input)`
  padding-left: ${(props) => props.prefixWidth || "2rem"};
`;

export default FormularioCliente;
