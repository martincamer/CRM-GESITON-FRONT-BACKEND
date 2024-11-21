import styled from "styled-components";
import { AlertTriangle } from "lucide-react";

const ModalEliminarProducto = ({ producto, onConfirm, onCancel }) => {
  return (
    <Container>
      <IconContainer>
        <AlertTriangle size={40} className="text-red-500" />
      </IconContainer>

      <Content>
        <Title>Eliminar Producto</Title>
        <Message>
          ¿Estás seguro que deseas eliminar el producto{" "}
          <ProductName>"{producto?.name}"</ProductName>?
        </Message>
        <WarningText>Esta acción no se puede deshacer.</WarningText>
      </Content>

      <ButtonContainer>
        <CancelButton onClick={onCancel}>Cancelar</CancelButton>
        <DeleteButton onClick={() => onConfirm(producto._id)}>
          Sí, eliminar
        </DeleteButton>
      </ButtonContainer>
    </Container>
  );
};

// Estilos
const Container = styled.div`
  padding: 1.5rem;
`;

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const Content = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const Message = styled.p`
  color: #4b5563;
  margin-bottom: 0.5rem;
`;

const ProductName = styled.span`
  font-weight: 600;
  color: #1f2937;
`;

const WarningText = styled.p`
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
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

const DeleteButton = styled(Button)`
  color: white;
  background-color: #dc2626;
  border: 1px solid transparent;

  &:hover {
    background-color: #b91c1c;
  }
`;

export default ModalEliminarProducto;
