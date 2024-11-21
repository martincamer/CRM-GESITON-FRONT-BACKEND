import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useCompras } from "../../../context/ComprasContext";
import styled from "styled-components";
import toast from "react-hot-toast";
import clienteAxios from "../../../config/clienteAxios";
import getConfig from "../../../helpers/configHeader";

// Styled Components
const FormField = styled.div`
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
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  &:focus {
    outline: none;
    border-color: #3b82f6;
    ring: 1px #3b82f6;
  }
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  &:focus {
    outline: none;
    border-color: #3b82f6;
    ring: 1px #3b82f6;
  }
`;

const TextArea = styled.textarea`
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 5rem;
  &:focus {
    outline: none;
    border-color: #3b82f6;
    ring: 1px #3b82f6;
  }
`;

const ErrorText = styled.span`
  color: #dc2626;
  font-size: 0.75rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
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

const FormGrid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  margin-bottom: 1.5rem;
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

const FormularioPagoProveedor = ({ providerId, onClose }) => {
  const { createPagoProveedor, METODOS_PAGO } = useCompras();
  const [procesando, setProcesando] = useState(false);
  const [comprasImpagas, setComprasImpagas] = useState([]);
  const [comprasSeleccionadas, setComprasSeleccionadas] = useState([]);
  const [montoTotal, setMontoTotal] = useState(0);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      paymentMethod: "EFECTIVO",
      reference: "",
      observation: "",
    },
  });

  // Obtener facturas impagas del proveedor
  useEffect(() => {
    const obtenerCompras = async () => {
      if (!providerId) return;

      const loadingToast = toast.loading("Cargando facturas...");
      try {
        const { data } = await clienteAxios.get(
          `/suppliers/${providerId}`,
          getConfig()
        );
        const comprasImpagas = data.supplier.documents.invoices.filter(
          (f) => f.paymentStatus !== "PAGADO"
        );
        setComprasImpagas(comprasImpagas);
      } catch (error) {
        console.error("Error al obtener facturas:", error);
        toast.error("Error al cargar las facturas");
      } finally {
        toast.dismiss(loadingToast);
      }
    };
    obtenerCompras();
  }, [providerId]);

  const handleCompraSelect = (compra, monto) => {
    const montoNumerico = parseFloat(monto) || 0;

    if (montoNumerico > compra.balance) {
      toast.error(
        `El monto no puede superar el saldo pendiente: S/ ${compra.balance}`
      );
      return;
    }

    setComprasSeleccionadas((prev) => {
      const nuevasCompras = prev.filter((c) => c._id !== compra._id);
      if (montoNumerico > 0) {
        nuevasCompras.push({
          _id: compra._id,
          amount: montoNumerico,
        });
      }
      return nuevasCompras;
    });

    // Calcular nuevo total
    const nuevasCompras = comprasSeleccionadas.filter(
      (c) => c._id !== compra._id
    );
    if (montoNumerico > 0) {
      nuevasCompras.push({
        _id: compra._id,
        amount: montoNumerico,
      });
    }
    const nuevoTotal = nuevasCompras.reduce(
      (acc, curr) => acc + curr.amount,
      0
    );
    setMontoTotal(nuevoTotal);
  };

  const onSubmit = async (data) => {
    if (comprasSeleccionadas.length === 0) {
      toast.error("Debe seleccionar al menos una factura");
      return;
    }

    setProcesando(true);
    try {
      // Validar que el monto total sea correcto
      const totalCalculado = comprasSeleccionadas.reduce(
        (acc, curr) => acc + curr.amount,
        0
      );

      if (totalCalculado !== montoTotal) {
        toast.error("Error en el cálculo del monto total");
        return;
      }

      const pagoData = {
        date: data.date,
        paymentMethod: data.paymentMethod,
        reference: data.reference || "",
        observation: data.observation || "",
        amount: totalCalculado,
        invoices: comprasSeleccionadas.map((factura) => ({
          _id: factura._id,
          amount: parseFloat(factura.amount),
        })),
      };

      console.log("Datos del pago a enviar:", pagoData); // Para debug

      const result = await createPagoProveedor(providerId, pagoData);

      if (result.success) {
        toast.success("Pago registrado exitosamente");
        onClose();
      }
    } catch (error) {
      console.error("Error al registrar pago:", error);
      const errorMessage =
        error.response?.data?.message || "Error al registrar el pago";
      toast.error(errorMessage);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormGrid>
        <FormField>
          <Label>Fecha</Label>
          <Controller
            name="date"
            control={control}
            rules={{ required: "Este campo es requerido" }}
            render={({ field }) => <Input type="date" {...field} />}
          />
          {errors.date && <ErrorText>{errors.date.message}</ErrorText>}
        </FormField>

        <FormField>
          <Label>Método de Pago</Label>
          <Controller
            name="paymentMethod"
            control={control}
            rules={{ required: "Este campo es requerido" }}
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
        </FormField>
      </FormGrid>

      <SectionTitle>Facturas Pendientes</SectionTitle>
      <FacturasGrid>
        {comprasImpagas?.map((compra) => (
          <FacturaRow key={compra._id}>
            <FacturaInfo>
              <span>Factura #{compra.invoiceNumber}</span>
              <span>Total: S/ {compra.total}</span>
              <span>Pendiente: S/ {compra.balance}</span>
            </FacturaInfo>
            <Input
              type="number"
              max={compra.balance}
              min="0"
              step="0.01"
              onChange={(e) => handleCompraSelect(compra, e.target.value)}
            />
          </FacturaRow>
        ))}
      </FacturasGrid>

      <TotalRow>
        <TotalLabel>Total a Pagar:</TotalLabel>
        <TotalValue>S/ {montoTotal.toFixed(2)}</TotalValue>
      </TotalRow>

      <ButtonContainer>
        <CancelButton type="button" onClick={onClose}>
          Cancelar
        </CancelButton>
        <SubmitButton type="submit" disabled={procesando || montoTotal <= 0}>
          {procesando ? "Procesando..." : "Registrar Pago"}
        </SubmitButton>
      </ButtonContainer>
    </form>
  );
};

export default FormularioPagoProveedor;
