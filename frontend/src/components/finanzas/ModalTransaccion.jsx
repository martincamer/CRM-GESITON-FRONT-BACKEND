import { useState } from "react";
import { X } from "lucide-react";
import { useCajaBanco } from "../../context/CajaBancoContext";
import styled from "styled-components";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

const ModalTransaccion = ({ isOpen, onClose, type, source }) => {
  const { crearTransaccionBanco, crearTransaccionCaja } = useCajaBanco();
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: "",
    transactionNumber: "",
  });
  const [loading, setLoading] = useState(false);

  const getCategoryByType = (transactionType) => {
    switch (transactionType) {
      case "DEPOSITO":
        return "DEPOSITO";
      case "EXTRACCION":
        return "EXTRACCION";
      case "TRANSFERENCIA":
        return "TRANSFERENCIA_BANCO";
      default:
        return "OTROS";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.amount || formData.amount <= 0) {
        toast.error("El monto debe ser mayor a cero");
        setLoading(false);
        return;
      }

      const transactionType =
        type === "DEPOSITO" || type === "INGRESO"
          ? "INGRESO"
          : type === "EXTRACCION" || type === "EGRESO"
          ? "EGRESO"
          : type;

      const transactionData = {
        ...formData,
        type: transactionType,
        amount: parseFloat(formData.amount),
        category: formData.category || type,
      };

      console.log("Enviando transacción:", transactionData);

      const result =
        source === "BANCO"
          ? await crearTransaccionBanco(transactionData)
          : await crearTransaccionCaja(transactionData);

      if (result.success) {
        onClose();
      }
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      toast.error(
        error.response?.data?.message || "Error al procesar la transacción"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Modal>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{type}</ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Monto</Label>
            <Input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </FormGroup>

          <FormGroup>
            <Label>Descripción</Label>
            <Input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Categoría</Label>
            <Select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione una categoría</option>
              {source === "BANCO" ? (
                <>
                  <option value="DEPOSITO">Depósito</option>
                  <option value="EXTRACCION">Extracción</option>
                  <option value="TRANSFERENCIA_BANCO">Transferencia</option>
                </>
              ) : (
                <>
                  <option value="VENTA">Venta</option>
                  <option value="COMPRA">Compra</option>
                  <option value="PAGO_PROVEEDOR">Pago a Proveedor</option>
                  <option value="GASTO">Gasto</option>
                  <option value="TRANSFERENCIA_BANCO">Transferencia</option>
                  <option value="OTROS">Otros</option>
                </>
              )}
            </Select>
          </FormGroup>

          {source === "BANCO" && (
            <FormGroup>
              <Label>Número de Operación</Label>
              <Input
                type="text"
                name="transactionNumber"
                value={formData.transactionNumber}
                onChange={handleChange}
              />
            </FormGroup>
          )}

          <ButtonGroup>
            <CancelButton type="button" onClick={onClose} disabled={loading}>
              Cancelar
            </CancelButton>
            <SubmitButton type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Procesando...
                </>
              ) : (
                "Confirmar"
              )}
            </SubmitButton>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </Modal>
  );
};

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 500px;
  padding: 1.5rem;
  position: relative;
  margin: 1rem;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  transition: all 0.2s;

  &:hover {
    background-color: #f3f4f6;
    color: #111827;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
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
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 1px #2563eb;
  }

  &:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: white;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 1px #2563eb;
  }

  &:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  color: #4b5563;
  background-color: white;
  border: 1px solid #d1d5db;

  &:hover:not(:disabled) {
    background-color: #f3f4f6;
  }
`;

const SubmitButton = styled(Button)`
  color: white;
  background-color: #2563eb;
  border: 1px solid transparent;

  &:hover:not(:disabled) {
    background-color: #1d4ed8;
  }
`;

const ErrorMessage = styled.p`
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

export default ModalTransaccion;
