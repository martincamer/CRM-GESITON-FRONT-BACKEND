import { useForm, Controller } from "react-hook-form";
import { useCompras } from "../../context/ComprasContext";
import styled from "styled-components";
import { toast } from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useProductos } from "../../context/ProductosContext";

const FormularioFactura = ({ proveedor, onClose, factura = null }) => {
  const { TIPOS_FACTURA, METODOS_PAGO, addFactura, updateFactura } =
    useCompras();

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
      invoiceNumber: factura?.invoiceNumber || "",
      invoiceType: factura?.invoiceType || "",
      date:
        factura?.date?.split("T")[0] || new Date().toISOString().split("T")[0],
      dueDate: factura?.dueDate?.split("T")[0] || "",
      items: factura?.items || [
        {
          product: "",
          description: "",
          quantity: "",
          unitPrice: "",
          taxRate: "21",
        },
      ],
      paymentMethod: factura?.paymentMethod || "",
      notes: factura?.notes || "",
    },
  });

  const items = watch("items");

  // Observar cambios en items para calcular totales
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

  const onSubmit = async (data) => {
    try {
      // Validar que todos los productos sean válidos
      const hasInvalidProducts = data.items.some((item) => !item.product);
      if (hasInvalidProducts) {
        toast.error("Todos los items deben tener un producto seleccionado");
        return;
      }

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

      const response = factura
        ? await updateFactura(proveedor._id, factura._id, formattedData)
        : await addFactura(proveedor._id, formattedData);

      if (response.success) {
        toast.success(
          factura
            ? "Factura actualizada exitosamente"
            : "Factura creada exitosamente"
        );
        onClose();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error al procesar factura:", error);
      toast.error("Error al procesar la factura");
    }
  };

  const totals = calculateTotals(items);

  return (
    <FormContainer onSubmit={handleSubmit(onSubmit)}>
      <FormGrid>
        {/* Datos de la Factura */}
        <FormSection>
          <SectionTitle>Datos de la Factura</SectionTitle>
          <FormRow>
            <FormGroup>
              <Label>Número de Factura *</Label>
              <Controller
                name="invoiceNumber"
                control={control}
                rules={{
                  required: "El número de factura es obligatorio",
                  pattern: {
                    value: /^\d{4}-\d{8}$/,
                    message: "Formato inválido (ej: 0001-00000001)",
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    error={errors.invoiceNumber}
                    placeholder="0001-00000001"
                  />
                )}
              />
              {errors.invoiceNumber && (
                <ErrorText>{errors.invoiceNumber.message}</ErrorText>
              )}
            </FormGroup>

            <FormGroup>
              <Label>Tipo de Factura *</Label>
              <Controller
                name="invoiceType"
                control={control}
                rules={{ required: "El tipo de factura es obligatorio" }}
                render={({ field }) => (
                  <Select {...field} error={errors.invoiceType}>
                    <option value="">Seleccionar...</option>
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
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>Fecha *</Label>
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
              <Label>Fecha de Vencimiento</Label>
              <Controller
                name="dueDate"
                control={control}
                render={({ field }) => <Input {...field} type="date" />}
              />
            </FormGroup>
          </FormRow>
        </FormSection>

        {/* Items */}
        <FormSection>
          <div className="flex justify-between items-center mb-4">
            <SectionTitle>Items</SectionTitle>
            <AddItemButton type="button" onClick={addItem}>
              <Plus size={20} />
              Agregar Item
            </AddItemButton>
          </div>

          {items.map((item, index) => (
            <ItemContainer key={index}>
              <FormRow>
                <FormGroup>
                  <Label>Producto *</Label>
                  <Controller
                    name={`items.${index}.product`}
                    control={control}
                    rules={{
                      required: "El producto es obligatorio",
                      validate: (value) =>
                        !!value || "Debe seleccionar un producto",
                    }}
                    render={({ field }) => (
                      <Select {...field} error={errors.items?.[index]?.product}>
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

                <FormGroup className="flex-1">
                  <Label>Descripción *</Label>
                  <Controller
                    name={`items.${index}.description`}
                    control={control}
                    rules={{ required: "La descripción es obligatoria" }}
                    render={({ field }) => (
                      <Input {...field} type="text" placeholder="Descripción" />
                    )}
                  />
                  {errors.items?.[index]?.description && (
                    <ErrorText>
                      {errors.items[index].description.message}
                    </ErrorText>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label>Cantidad *</Label>
                  <Controller
                    name={`items.${index}.quantity`}
                    control={control}
                    rules={{
                      required: "La cantidad es obligatoria",
                      min: {
                        value: 0.01,
                        message: "La cantidad debe ser mayor a 0",
                      },
                    }}
                    render={({ field }) => (
                      <Input {...field} type="number" min="0" step="1" />
                    )}
                  />
                  {errors.items?.[index]?.quantity && (
                    <ErrorText>
                      {errors.items[index].quantity.message}
                    </ErrorText>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label>Precio Unitario *</Label>
                  <PriceInputContainer>
                    <PriceSymbol>$</PriceSymbol>
                    <Controller
                      name={`items.${index}.unitPrice`}
                      control={control}
                      rules={{
                        required: "El precio es obligatorio",
                        min: {
                          value: 0.01,
                          message: "El precio debe ser mayor a 0",
                        },
                      }}
                      render={({ field }) => (
                        <PriceInput
                          {...field}
                          type="number"
                          min="0"
                          step="0.01"
                        />
                      )}
                    />
                  </PriceInputContainer>
                  {errors.items?.[index]?.unitPrice && (
                    <ErrorText>
                      {errors.items[index].unitPrice.message}
                    </ErrorText>
                  )}
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

          <TotalContainer>
            <TotalRow>
              <span>Subtotal:</span>
              <span>${totals.subtotal.toFixed(2)}</span>
            </TotalRow>
            <TotalRow>
              <span>IVA:</span>
              <span>${totals.tax.toFixed(2)}</span>
            </TotalRow>
            <TotalRow>
              <span>Total:</span>
              <span>${totals.total.toFixed(2)}</span>
            </TotalRow>
          </TotalContainer>
        </FormSection>

        {/* Método de Pago y Notas */}
        <FormSection>
          <SectionTitle>Pago y Notas</SectionTitle>
          <FormRow>
            <FormGroup>
              <Label>Método de Pago</Label>
              <Controller
                name="paymentMethod"
                control={control}
                render={({ field }) => (
                  <Select {...field}>
                    <option value="">Seleccionar...</option>
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

          <FormGroup>
            <Label>Notas</Label>
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
          {isSubmitting ? "Procesando..." : factura ? "Actualizar" : "Crear"}{" "}
          Factura
        </SubmitButton>
      </ButtonContainer>
    </FormContainer>
  );
};

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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: start;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &.flex-1 {
    flex: 1;
  }
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
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
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
  color: #ef4444;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background-color: #fee2e2;
  }
`;

export default FormularioFactura;
