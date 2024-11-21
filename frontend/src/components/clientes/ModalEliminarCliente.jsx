import styled from "styled-components";
import { AlertTriangle } from "lucide-react";

const ModalEliminarCliente = ({ cliente, onConfirm, onCancel }) => {
  if (!cliente) return null;

  return (
    <Container>
      <IconContainer>
        <AlertTriangle size={50} color="#EF4444" />
      </IconContainer>
      <Title>Eliminar Cliente</Title>
      <Message>
        ¿Estás seguro de eliminar al cliente{" "}
        <strong>{cliente.businessName}</strong>? Esta acción no se puede
        deshacer.
      </Message>
      <ButtonContainer>
        <CancelButton onClick={onCancel}>Cancelar</CancelButton>
        <DeleteButton onClick={() => onConfirm(cliente._id)}>
          Sí, Eliminar
        </DeleteButton>
      </ButtonContainer>
    </Container>
  );
};

// Estilos
const Container = styled.div`
  text-align: center;
  padding: 1.5rem;
`;

const IconContainer = styled.div`
  margin-bottom: 1rem;
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const Message = styled.p`
  color: #4b5563;
  margin-bottom: 1.5rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
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

const DeleteButton = styled(Button)`
  background-color: #ef4444;
  color: white;
  &:hover {
    background-color: #dc2626;
  }
`;

export default ModalEliminarCliente;
