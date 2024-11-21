import { useForm, Controller } from "react-hook-form";
import { useCompras } from "../../context/ComprasContext";
import styled from "styled-components";
import { toast } from "react-hot-toast";

const FormularioProveedor = ({ onClose, proveedor = null }) => {
  const { createProveedor, updateProveedor, CONDICIONES_FISCALES } =
    useCompras();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      businessName: proveedor?.businessName || "",
      fantasyName: proveedor?.fantasyName || "",
      cuit: proveedor?.cuit || "",
      taxCondition: proveedor?.taxCondition || "",
      contact: {
        email: proveedor?.contact?.email || "",
        phone: proveedor?.contact?.phone || "",
        alternativePhone: proveedor?.contact?.alternativePhone || "",
        website: proveedor?.contact?.website || "",
      },
      address: {
        street: proveedor?.address?.street || "",
        number: proveedor?.address?.number || "",
        floor: proveedor?.address?.floor || "",
        apartment: proveedor?.address?.apartment || "",
        city: proveedor?.address?.city || "",
        state: proveedor?.address?.state || "",
        zipCode: proveedor?.address?.zipCode || "",
      },
      paymentConditions: {
        defaultDueDays: proveedor?.paymentConditions?.defaultDueDays || "",
        creditLimit: proveedor?.paymentConditions?.creditLimit || "",
      },
      notes: proveedor?.notes || "",
      isActive: proveedor?.isActive ?? true,
    },
  });

  const onSubmit = async (data) => {
    try {
      const formattedData = {
        ...data,
        paymentConditions: {
          ...data.paymentConditions,
          defaultDueDays: Number(data.paymentConditions.defaultDueDays),
          creditLimit: Number(data.paymentConditions.creditLimit),
        },
      };

      const response = proveedor
        ? await updateProveedor(proveedor._id, formattedData)
        : await createProveedor(formattedData);

      if (response.success) {
        onClose();
      } else {
        if (response.type === "duplicate") {
          setError(response.field, {
            type: "manual",
            message: response.message,
          });
        } else {
          toast.error(response.message);
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
        {/* Datos Principales */}
        <FormSection>
          <SectionTitle>Datos Principales</SectionTitle>
          <FormRow>
            <FormGroup>
              <Label>Razón Social *</Label>
              <Controller
                name="businessName"
                control={control}
                rules={{
                  required: "La razón social es obligatoria",
                  minLength: {
                    value: 3,
                    message: "La razón social debe tener al menos 3 caracteres",
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
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
                  <Input
                    {...field}
                    type="text"
                    placeholder="Nombre de fantasía"
                  />
                )}
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>CUIT *</Label>
              <Controller
                name="cuit"
                control={control}
                rules={{
                  required: "El CUIT es obligatorio",
                  pattern: {
                    value: /^\d{2}-\d{8}-\d{1}$/,
                    message: "Formato inválido (XX-XXXXXXXX-X)",
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    error={errors.cuit}
                    placeholder="XX-XXXXXXXX-X"
                  />
                )}
              />
              {errors.cuit && <ErrorText>{errors.cuit.message}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>Condición Fiscal *</Label>
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
          <SectionTitle>Contacto</SectionTitle>
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
                    placeholder="email@ejemplo.com"
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
                  <Input {...field} type="tel" placeholder="Teléfono" />
                )}
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>Teléfono Alternativo</Label>
              <Controller
                name="contact.alternativePhone"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="tel"
                    placeholder="Teléfono alternativo"
                  />
                )}
              />
            </FormGroup>

            <FormGroup>
              <Label>Sitio Web</Label>
              <Controller
                name="contact.website"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="url" placeholder="www.ejemplo.com" />
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
                render={({ field }) => (
                  <Input {...field} type="text" placeholder="Calle" />
                )}
              />
            </FormGroup>

            <FormGroup>
              <Label>Número</Label>
              <Controller
                name="address.number"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="text" placeholder="Número" />
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
                render={({ field }) => (
                  <Input {...field} type="text" placeholder="Piso" />
                )}
              />
            </FormGroup>

            <FormGroup>
              <Label>Departamento</Label>
              <Controller
                name="address.apartment"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="text" placeholder="Departamento" />
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
                  <Input {...field} type="text" placeholder="Ciudad" />
                )}
              />
            </FormGroup>

            <FormGroup>
              <Label>Provincia</Label>
              <Controller
                name="address.state"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="text" placeholder="Provincia" />
                )}
              />
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label>Código Postal</Label>
            <Controller
              name="address.zipCode"
              control={control}
              render={({ field }) => (
                <Input {...field} type="text" placeholder="Código postal" />
              )}
            />
          </FormGroup>
        </FormSection>

        {/* Condiciones de Pago */}
        <FormSection>
          <SectionTitle>Condiciones de Pago</SectionTitle>
          <FormRow>
            <FormGroup>
              <Label>Días de Vencimiento</Label>
              <Controller
                name="paymentConditions.defaultDueDays"
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

            <FormGroup>
              <Label>Límite de Crédito</Label>
              <PriceInputContainer>
                <PriceSymbol>$</PriceSymbol>
                <Controller
                  name="paymentConditions.creditLimit"
                  control={control}
                  render={({ field }) => (
                    <PriceInput
                      {...field}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  )}
                />
              </PriceInputContainer>
            </FormGroup>
          </FormRow>
        </FormSection>

        {/* Notas */}
        <FormSection>
          <SectionTitle>Notas</SectionTitle>
          <FormGroup>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  rows="3"
                  placeholder="Notas adicionales..."
                />
              )}
            />
          </FormGroup>
        </FormSection>

        <FormGroup>
          <CheckboxContainer>
            <Controller
              name="isActive"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <Checkbox
                  {...field}
                  type="checkbox"
                  checked={value}
                  onChange={(e) => onChange(e.target.checked)}
                />
              )}
            />
            <CheckboxLabel>Proveedor activo</CheckboxLabel>
          </CheckboxContainer>
        </FormGroup>
      </FormGrid>

      <ButtonContainer>
        <CancelButton type="button" onClick={onClose}>
          Cancelar
        </CancelButton>
        <SubmitButton type="submit">
          {proveedor ? "Actualizar" : "Crear"} Proveedor
        </SubmitButton>
      </ButtonContainer>
    </FormContainer>
  );
};

// Estilos (los mismos que FormularioProducto)
// Estilos
const FormContainer = styled.form`
  width: 100%;
`;

const FormGrid = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const FormSection = styled.div`
  display: grid;
  gap: 1rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 6px;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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
  width: 100%;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }
`;

const TextArea = styled.textarea`
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  width: 100%;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }
`;

const PriceInputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const PriceSymbol = styled.span`
  position: absolute;
  left: 0.75rem;
  color: #6b7280;
`;

const PriceInput = styled(Input)`
  padding-left: 1.5rem;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 1rem;
  height: 1rem;
  border-radius: 4px;
  border: 1px solid #d1d5db;

  &:checked {
    background-color: #3b82f6;
    border-color: #3b82f6;
  }
`;

const CheckboxLabel = styled.label`
  font-size: 0.875rem;
  color: #374151;
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
`;

const ErrorText = styled.span`
  color: #ef4444;
  font-size: 0.75rem;
`;
// ... resto de los estilos igual que FormularioProducto ...

export default FormularioProveedor;
