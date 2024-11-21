import styled from "styled-components";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <Container>
      <Content>
        <ErrorCode>404</ErrorCode>
        <Title>Página no encontrada</Title>
        <Description>
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </Description>
        <ButtonGroup>
          <BackButton onClick={() => window.history.back()}>
            <ArrowLeft size={20} />
            Volver atrás
          </BackButton>
          <HomeButton to="/dashboard">
            <Home size={20} />
            Ir al inicio
          </HomeButton>
        </ButtonGroup>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #f9fafb;
`;

const Content = styled.div`
  text-align: center;
  max-width: 28rem;
`;

const ErrorCode = styled.h1`
  font-size: 6rem;
  font-weight: 700;
  color: #3b82f6;
  line-height: 1;
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  font-size: 1.875rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
`;

const Description = styled.p`
  color: #6b7280;
  margin-bottom: 2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #2563eb;
  }
`;

const HomeButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #fff;
  color: #3b82f6;
  border: 1px solid #3b82f6;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #f3f4f6;
  }
`;

export default NotFound;
