import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useClientes } from "../../../context/ClientesContext";
import styled from "styled-components";
import toast from "react-hot-toast";
import clienteAxios from "../../../config/clienteAxios";
import getConfig from "../../../helpers/configHeader";

const FormularioPago = ({ clienteId, onClose }) => {
  const { createPago, METODOS_PAGO } = useClientes();
  const [procesando, setProcesando] = useState(false);
  const [facturasImpagas, setFacturasImpagas] = useState([]);
  const [facturasSeleccionadas, setFacturasSeleccionadas] = useState([]);
  const [montoTotal, setMontoTotal] = useState(0);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      paymentMethod: "EFECTIVO",
      amount: "",
      reference: "",
      observation: "",
    },
  });

  // Obtener facturas impagas del cliente
  useEffect(() => {
    const obtenerFacturas = async () => {
      const loadingToast = toast.loading("Cargando facturas...");
      try {
        const { data } = await clienteAxios.get(
          `/clients/${clienteId}`,
          getConfig()
        );
        const facturasImpagas = data.client.documents.invoices.filter(
          (f) => f.paymentStatus !== "PAGADO"
        );
        setFacturasImpagas(facturasImpagas);
      } catch (error) {
        console.error("Error al obtener facturas:", error);
        toast.error("Error al cargar las facturas");
      } finally {
        toast.dismiss(loadingToast);
      }
    };
    obtenerFacturas();
  }, [clienteId]);

  // Manejar selección de facturas
  const handleFacturaSelect = (factura, montoAsignado) => {
    const facturaIndex = facturasSeleccionadas.findIndex(
      (f) => f.invoice === factura._id
    );

    if (facturaIndex >= 0) {
      // Actualizar monto si ya existe
      const nuevasFacturas = [...facturasSeleccionadas];
      nuevasFacturas[facturaIndex].amount = Number(montoAsignado);
      setFacturasSeleccionadas(nuevasFacturas);
    } else {
      // Agregar nueva factura
      setFacturasSeleccionadas([
        ...facturasSeleccionadas,
        {
          invoice: factura._id,
          amount: Number(montoAsignado),
        },
      ]);
    }

    // Actualizar monto total
    const nuevoTotal = facturasSeleccionadas.reduce(
      (acc, curr) => acc + curr.amount,
      0
    );
    setMontoTotal(nuevoTotal);
    setValue("amount", nuevoTotal);
  };

  const onSubmit = async (data) => {
    if (facturasSeleccionadas.length === 0) {
      toast.error("Debe seleccionar al menos una factura");
      return;
    }

    const loadingToast = toast.loading("Procesando pago...");
    try {
      setProcesando(true);
      const pagoData = {
        ...data,
        invoices: facturasSeleccionadas,
      };

      const response = await createPago(clienteId, pagoData);
      if (response.ok) {
        toast.success("Pago registrado exitosamente");
        onClose();
      }
    } catch (error) {
      console.error("Error al crear pago:", error);
      toast.error("Error al registrar el pago");
    } finally {
      setProcesando(false);
      toast.dismiss(loadingToast);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit(onSubmit)}>
      <FormGrid>
        {/* Datos básicos */}
        <FormSection>
          <FormRow>
            <FormGroup>
              <Label>Fecha</Label>
              <Controller
                name="date"
                control={control}
                rules={{ required: "La fecha es requerida" }}
                render={({ field }) => (
                  <Input type="date" {...field} error={errors.date} />
                )}
              />
              {errors.date && <ErrorText>{errors.date.message}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>Método de Pago</Label>
              <Controller
                name="paymentMethod"
                control={control}
                rules={{ required: "El método de pago es requerido" }}
                render={({ field }) => (
                  <Select {...field} error={errors.paymentMethod}>
                    {METODOS_PAGO.map((metodo) => (
                      <option key={metodo.value} value={metodo.value}>
                        {metodo.label}
                      </option>
                    ))}
                  </Select>
                )}
              />
              {errors.paymentMethod && (
                <ErrorText>{errors.paymentMethod.message}</ErrorText>
              )}
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label>Referencia</Label>
            <Controller
              name="reference"
              control={control}
              render={({ field }) => (
                <Input
                  type="text"
                  placeholder="Número de transferencia, cheque, etc."
                  {...field}
                />
              )}
            />
          </FormGroup>
        </FormSection>

        {/* Facturas */}
        <FormSection>
          <SectionTitle>Facturas a Pagar</SectionTitle>
          <FacturasGrid>
            {facturasImpagas.map((factura) => (
              <FacturaRow key={factura._id}>
                <FacturaInfo>
                  <div>Factura #{factura.invoiceNumber}</div>
                  <div>${factura.total.toLocaleString()}</div>
                </FacturaInfo>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max={factura.total}
                  onChange={(e) => handleFacturaSelect(factura, e.target.value)}
                />
              </FacturaRow>
            ))}
          </FacturasGrid>
          <TotalRow>
            <TotalLabel>Total a Pagar:</TotalLabel>
            <TotalValue>${montoTotal.toLocaleString()}</TotalValue>
          </TotalRow>
        </FormSection>

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
        <SubmitButton type="submit" disabled={procesando}>
          {procesando ? "Procesando..." : "Registrar Pago"}
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

const FacturasGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const FacturaRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const FacturaInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const TotalRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const TotalLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const TotalValue = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

export default FormularioPago;
