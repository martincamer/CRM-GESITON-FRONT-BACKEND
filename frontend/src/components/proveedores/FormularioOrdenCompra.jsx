import { useForm, Controller } from "react-hook-form";
import { useCompras } from "../../context/ComprasContext";
import { toast } from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { addDays } from "date-fns";
import { useProductos } from "../../context/ProductosContext";
import styled from "styled-components";

const FormularioOrdenCompra = ({ proveedor, onClose, orden = null }) => {
  const { addOrdenCompra, updateOrdenCompra } = useCompras();

  const { productos, getProductos } = useProductos();

  useEffect(() => {
    getProductos();
  }, []);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      orderNumber: orden?.orderNumber || "",
      date:
        orden?.date?.split("T")[0] || new Date().toISOString().split("T")[0],
      deliveryDate:
        orden?.deliveryDate?.split("T")[0] ||
        addDays(new Date(), 7).toISOString().split("T")[0],
      items: orden?.items || [
        {
          product: "",
          description: "",
          quantity: "",
          unitPrice: "",
          taxRate: "21",
        },
      ],
      deliveryAddress: orden?.deliveryAddress || {
        street: "",
        number: "",
        floor: "",
        apartment: "",
        city: "",
        state: "",
        zipCode: "",
      },
      notes: orden?.notes || "",
      status: orden?.status || "pending",
    },
  });

  const items = watch("items");

  useEffect(() => {
    const totals = calculateTotals(items);
    setValue("subtotal", totals.subtotal);
    setValue("taxAmount", totals.tax);
    setValue("total", totals.total);
  }, [items, setValue]);

  const addItem = () => {
    setValue("items", [
      ...items,
      {
        product: "",
        description: "",
        quantity: "",
        unitPrice: "",
        taxRate: "21",
      },
    ]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setValue("items", newItems);
  };

  const calculateTotals = (items) => {
    return items.reduce(
      (acc, item) => {
        if (!item.quantity || !item.unitPrice) return acc;
        const subtotal = Number(item.quantity) * Number(item.unitPrice);
        const tax = (subtotal * Number(item.taxRate)) / 100;
        return {
          subtotal: acc.subtotal + subtotal,
          tax: acc.tax + tax,
          total: acc.total + subtotal + tax,
        };
      },
      { subtotal: 0, tax: 0, total: 0 }
    );
  };

  const handleProductSelect = (index, productId) => {
    const product = productos.find((p) => p._id === productId);
    if (product) {
      setValue(`items.${index}.description`, product.description || "");
      setValue(`items.${index}.unitPrice`, product.price || "");
    }
  };

  const onSubmit = async (data) => {
    try {
      const totals = calculateTotals(data.items);
      const formattedData = {
        ...data,
        ...totals,
        items: data.items.map((item) => ({
          ...item,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          taxRate: Number(item.taxRate),
          subtotal: Number(item.quantity) * Number(item.unitPrice),
        })),
      };

      const response = orden
        ? await updateOrdenCompra(proveedor._id, orden._id, formattedData)
        : await addOrdenCompra(proveedor._id, formattedData);

      if (response.success) {
        toast.success(
          orden ? "Orden actualizada exitosamente" : "Orden creada exitosamente"
        );
        onClose();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error al procesar orden:", error);
      toast.error("Error al procesar la orden de compra");
    }
  };

  const totals = calculateTotals(items);

  return (
    <FormContainer onSubmit={handleSubmit(onSubmit)}>
      <FormGrid>
        {/* Datos de la Orden */}
        <FormSection>
          <SectionTitle>Datos de la Orden</SectionTitle>
          <FormRow>
            <FormGroup>
              <Label>Número de Orden *</Label>
              <Controller
                name="orderNumber"
                control={control}
                rules={{
                  required: "El número de orden es obligatorio",
                  pattern: {
                    value: /^\d{4}-\d{8}$/,
                    message: "Formato inválido (ej: 0001-00000001)",
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    error={errors.orderNumber}
                    placeholder="0001-00000001"
                  />
                )}
              />
              {errors.orderNumber && (
                <ErrorText>{errors.orderNumber.message}</ErrorText>
              )}
            </FormGroup>

            <FormGroup>
              <Label>Fecha de Emisión *</Label>
              <Controller
                name="date"
                control={control}
                rules={{ required: "La fecha es obligatoria" }}
                render={({ field }) => (
                  <Input {...field} type="date" error={errors.date} />
                )}
              />
              {errors.date && <ErrorText>{errors.date.message}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>Fecha de Entrega *</Label>
              <Controller
                name="deliveryDate"
                control={control}
                rules={{ required: "La fecha de entrega es obligatoria" }}
                render={({ field }) => (
                  <Input {...field} type="date" error={errors.deliveryDate} />
                )}
              />
              {errors.deliveryDate && (
                <ErrorText>{errors.deliveryDate.message}</ErrorText>
              )}
            </FormGroup>
          </FormRow>
        </FormSection>

        {/* Items */}
        <FormSection>
          <SectionTitle>Items</SectionTitle>
          {items.map((item, index) => (
            <ItemContainer key={index}>
              <FormRow>
                <FormGroup>
                  <Label>Producto *</Label>
                  <Controller
                    name={`items.${index}.product`}
                    control={control}
                    rules={{ required: "El producto es obligatorio" }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        error={errors.items?.[index]?.product}
                        onChange={(e) => {
                          field.onChange(e);
                          handleProductSelect(index, e.target.value);
                        }}
                      >
                        <option value="">Seleccionar producto...</option>
                        {Array.isArray(productos) &&
                          productos.map((producto) => (
                            <option key={producto._id} value={producto._id}>
                              {producto.name}
                            </option>
                          ))}
                      </Select>
                    )}
                  />
                  {errors.items?.[index]?.product && (
                    <ErrorText>{errors.items[index].product.message}</ErrorText>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label>Descripción</Label>
                  <Controller
                    name={`items.${index}.description`}
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="text" placeholder="Descripción" />
                    )}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Cantidad *</Label>
                  <Controller
                    name={`items.${index}.quantity`}
                    control={control}
                    rules={{
                      required: "La cantidad es obligatoria",
                      min: {
                        value: 1,
                        message: "La cantidad debe ser mayor a 0",
                      },
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        min="1"
                        step="1"
                        error={errors.items?.[index]?.quantity}
                      />
                    )}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Precio Unitario *</Label>
                  <Controller
                    name={`items.${index}.unitPrice`}
                    control={control}
                    rules={{
                      required: "El precio es obligatorio",
                      min: {
                        value: 0,
                        message: "El precio no puede ser negativo",
                      },
                    }}
                    render={({ field }) => (
                      <PriceInputContainer>
                        <PriceSymbol>$</PriceSymbol>
                        <PriceInput
                          {...field}
                          type="number"
                          min="0"
                          step="0.01"
                          error={errors.items?.[index]?.unitPrice}
                        />
                      </PriceInputContainer>
                    )}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>IVA %</Label>
                  <Controller
                    name={`items.${index}.taxRate`}
                    control={control}
                    render={({ field }) => (
                      <Select {...field}>
                        <option value="21">21%</option>
                        <option value="10.5">10.5%</option>
                        <option value="27">27%</option>
                        <option value="0">0%</option>
                      </Select>
                    )}
                  />
                </FormGroup>

                {items.length > 1 && (
                  <RemoveItemButton
                    type="button"
                    onClick={() => removeItem(index)}
                    title="Eliminar item"
                  >
                    <Trash2 size={20} />
                  </RemoveItemButton>
                )}
              </FormRow>
            </ItemContainer>
          ))}

          <AddItemButton type="button" onClick={addItem}>
            <Plus size={20} />
            Agregar Item
          </AddItemButton>

          <TotalContainer>
            <TotalRow>
              <span>Subtotal:</span>
              <span>
                {new Intl.NumberFormat("es-AR", {
                  style: "currency",
                  currency: "ARS",
                }).format(totals.subtotal)}
              </span>
            </TotalRow>
            <TotalRow>
              <span>IVA:</span>
              <span>
                {new Intl.NumberFormat("es-AR", {
                  style: "currency",
                  currency: "ARS",
                }).format(totals.tax)}
              </span>
            </TotalRow>
            <TotalRow>
              <span>Total:</span>
              <span>
                {new Intl.NumberFormat("es-AR", {
                  style: "currency",
                  currency: "ARS",
                }).format(totals.total)}
              </span>
            </TotalRow>
          </TotalContainer>
        </FormSection>

        {/* Dirección de Entrega */}
        <FormSection>
          <SectionTitle>Dirección de Entrega</SectionTitle>
          <FormRow>
            <FormGroup>
              <Label>Calle *</Label>
              <Controller
                name="deliveryAddress.street"
                control={control}
                rules={{ required: "La calle es obligatoria" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    error={errors.deliveryAddress?.street}
                  />
                )}
              />
            </FormGroup>

            <FormGroup>
              <Label>Número *</Label>
              <Controller
                name="deliveryAddress.number"
                control={control}
                rules={{ required: "El número es obligatorio" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    error={errors.deliveryAddress?.number}
                  />
                )}
              />
            </FormGroup>

            <FormGroup>
              <Label>Piso</Label>
              <Controller
                name="deliveryAddress.floor"
                control={control}
                render={({ field }) => <Input {...field} type="text" />}
              />
            </FormGroup>

            <FormGroup>
              <Label>Depto</Label>
              <Controller
                name="deliveryAddress.apartment"
                control={control}
                render={({ field }) => <Input {...field} type="text" />}
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>Ciudad *</Label>
              <Controller
                name="deliveryAddress.city"
                control={control}
                rules={{ required: "La ciudad es obligatoria" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    error={errors.deliveryAddress?.city}
                  />
                )}
              />
            </FormGroup>

            <FormGroup>
              <Label>Provincia *</Label>
              <Controller
                name="deliveryAddress.state"
                control={control}
                rules={{ required: "La provincia es obligatoria" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    error={errors.deliveryAddress?.state}
                  />
                )}
              />
            </FormGroup>

            <FormGroup>
              <Label>Código Postal *</Label>
              <Controller
                name="deliveryAddress.zipCode"
                control={control}
                rules={{ required: "El código postal es obligatorio" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    error={errors.deliveryAddress?.zipCode}
                  />
                )}
              />
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
      </FormGrid>

      <ButtonContainer>
        <CancelButton type="button" onClick={onClose}>
          Cancelar
        </CancelButton>
        <SubmitButton type="submit" disabled={isSubmitting}>
          {orden ? "Actualizar" : "Crear"} Orden
        </SubmitButton>
      </ButtonContainer>
    </FormContainer>
  );
};

// Aquí van todos los estilos que te compartí anteriormente
// ... (resto de los estilos igual que en FormularioFactura)
// Estilos completos
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: start;
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

  &::after {
    content: ${(props) => (props.required ? '" *"' : '""')};
    color: #ef4444;
    margin-left: 0.25rem;
  }
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

  &:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
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

const TextArea = styled.textarea`
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  width: 100%;
  resize: vertical;
  min-height: 100px;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }
`;

const ItemContainer = styled.div`
  padding: 1rem;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  margin-bottom: 1rem;
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  color: #374151;
  background-color: white;
  border: 1px solid #d1d5db;

  &:hover:not(:disabled) {
    background-color: #f3f4f6;
  }
`;

const SubmitButton = styled(Button)`
  color: white;
  background-color: #3b82f6;
  border: 1px solid transparent;

  &:hover:not(:disabled) {
    background-color: #2563eb;
  }
`;

const ErrorText = styled.span`
  color: #ef4444;
  font-size: 0.75rem;
`;

const TotalContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.875rem;

  &:last-child {
    font-weight: 600;
    font-size: 1rem;
    border-top: 1px solid #e5e7eb;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
  }
`;

const AddItemButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #3b82f6;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background-color: #eff6ff;
  }
`;

const RemoveItemButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
  align-self: flex-end;
  margin-bottom: 0.5rem;

  &:hover {
    background-color: #fee2e2;
  }
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
  background-color: ${(props) => {
    switch (props.variant) {
      case "success":
        return "#dcfce7";
      case "warning":
        return "#fef9c3";
      case "error":
        return "#fee2e2";
      default:
        return "#f3f4f6";
    }
  }};
  color: ${(props) => {
    switch (props.variant) {
      case "success":
        return "#166534";
      case "warning":
        return "#854d0e";
      case "error":
        return "#991b1b";
      default:
        return "#374151";
    }
  }};
`;

const Divider = styled.hr`
  border: 0;
  border-top: 1px solid #e5e7eb;
  margin: 1rem 0;
`;

const InfoText = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.5rem;
`;

export default FormularioOrdenCompra;
