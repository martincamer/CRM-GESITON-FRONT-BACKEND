import { useForm, Controller } from "react-hook-form";
import { useProductos } from "../../context/ProductosContext";
import styled from "styled-components";
import { toast } from "react-hot-toast";

const FormularioProducto = ({ onClose, producto = null }) => {
  const { createProducto, updateProducto, TIPOS_PRODUCTO, UNIDADES_MEDIDA } =
    useProductos();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      name: producto?.name || "",
      description: producto?.description || "",
      type: producto?.type || "",
      unit: producto?.unit || "",
      price: producto?.price || "",
      isActive: producto?.isActive ?? true,
    },
  });

  const onSubmit = async (data) => {
    try {
      const formattedData = {
        ...data,
        price: Number(data.price),
      };

      const response = producto
        ? await updateProducto(producto._id, formattedData)
        : await createProducto(formattedData);

      if (response.success) {
        onClose();
      } else {
        if (response.errors) {
          Object.keys(response.errors).forEach((field) => {
            setError(field, {
              type: "server",
              message: response.errors[field].message,
            });
          });
        } else if (response.message?.includes("nombre")) {
          setError("name", {
            type: "manual",
            message: "Ya existe un producto con este nombre",
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
        <FormGroup>
          <Label>Nombre</Label>
          <Controller
            name="name"
            control={control}
            rules={{
              required: "El nombre es obligatorio",
              minLength: {
                value: 3,
                message: "El nombre debe tener al menos 3 caracteres",
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                type="text"
                error={errors.name}
                placeholder="Nombre del producto"
              />
            )}
          />
          {errors.name && <ErrorText>{errors.name.message}</ErrorText>}
        </FormGroup>

        <FormGroup>
          <Label>Descripción</Label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextArea
                {...field}
                rows="3"
                placeholder="Descripción del producto"
              />
            )}
          />
        </FormGroup>

        <FormRow>
          <FormGroup>
            <Label>Tipo</Label>
            <Controller
              name="type"
              control={control}
              rules={{ required: "El tipo es obligatorio" }}
              render={({ field }) => (
                <Select {...field} error={errors.type}>
                  <option value="">Seleccionar tipo</option>
                  {TIPOS_PRODUCTO.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </Select>
              )}
            />
            {errors.type && <ErrorText>{errors.type.message}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label>Unidad</Label>
            <Controller
              name="unit"
              control={control}
              rules={{ required: "La unidad es obligatoria" }}
              render={({ field }) => (
                <Select {...field} error={errors.unit}>
                  <option value="">Seleccionar unidad</option>
                  {UNIDADES_MEDIDA.map((unidad) => (
                    <option key={unidad.value} value={unidad.value}>
                      {unidad.label}
                    </option>
                  ))}
                </Select>
              )}
            />
            {errors.unit && <ErrorText>{errors.unit.message}</ErrorText>}
          </FormGroup>
        </FormRow>

        <FormGroup>
          <Label>Precio</Label>
          <PriceInputContainer>
            <PriceSymbol>$</PriceSymbol>
            <Controller
              name="price"
              control={control}
              rules={{
                required: "El precio es obligatorio",
                min: {
                  value: 0.01,
                  message: "El precio debe ser mayor a 0",
                },
                pattern: {
                  value: /^\d*\.?\d{0,2}$/,
                  message: "Formato de precio inválido",
                },
              }}
              render={({ field }) => (
                <PriceInput
                  {...field}
                  type="number"
                  error={errors.price}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              )}
            />
          </PriceInputContainer>
          {errors.price && <ErrorText>{errors.price.message}</ErrorText>}
        </FormGroup>

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
            <CheckboxLabel>Producto activo</CheckboxLabel>
          </CheckboxContainer>
        </FormGroup>
      </FormGrid>

      <ButtonContainer>
        <CancelButton type="button" onClick={onClose}>
          Cancelar
        </CancelButton>
        <SubmitButton type="submit">
          {producto ? "Actualizar" : "Crear"} Producto
        </SubmitButton>
      </ButtonContainer>
    </FormContainer>
  );
};

const FormContainer = styled.form`
  width: 100%;
`;

const FormGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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

export default FormularioProducto;
