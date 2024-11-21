import { useState } from "react";
import styled from "styled-components";
import {
  Building2,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useCajaBanco } from "../context/CajaBancoContext";
import ModalTransaccion from "../components/finanzas/ModalTransaccion";

const Bancos = () => {
  const { banco, loading } = useCajaBanco();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");

  const handleOpenModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Loader2 className="animate-spin" size={48} />
        <LoadingText>Cargando datos bancarios...</LoadingText>
      </LoadingContainer>
    );
  }

  if (!banco) {
    return (
      <EmptyState>
        <Building2 size={48} />
        <EmptyTitle>No hay cuenta bancaria configurada</EmptyTitle>
        <EmptyDescription>
          Contacta al administrador para configurar tu cuenta bancaria.
        </EmptyDescription>
      </EmptyState>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <Building2 size={24} />
          Banco
        </Title>
        <HeaderActions>
          <Button onClick={() => handleOpenModal("DEPOSITO")}>
            <ArrowUpRight size={18} />
            Depósito
          </Button>
          <Button
            variant="danger"
            onClick={() => handleOpenModal("EXTRACCION")}
          >
            <ArrowDownLeft size={18} />
            Extracción
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleOpenModal("TRANSFERENCIA")}
          >
            <RefreshCw size={18} />
            Transferencia
          </Button>
        </HeaderActions>
      </Header>

      <Grid>
        <Card>
          <CardHeader>
            <CardTitle>Información de la Cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>Banco</InfoLabel>
                <InfoValue>{banco.bankName}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Número de Cuenta</InfoLabel>
                <InfoValue>{banco.accountNumber}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Tipo de Cuenta</InfoLabel>
                <InfoValue>{banco.accountType}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Saldo Actual</InfoLabel>
                <InfoValue>
                  {new Intl.NumberFormat("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  }).format(banco.balance)}
                </InfoValue>
              </InfoItem>
            </InfoGrid>
          </CardContent>
        </Card>
      </Grid>

      <Section>
        <SectionTitle>Últimos Movimientos</SectionTitle>
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <Th>Fecha</Th>
                <Th>Tipo</Th>
                <Th>Descripción</Th>
                <Th>N° Operación</Th>
                <Th align="right">Monto</Th>
                <Th>Categoría</Th>
              </tr>
            </thead>
            <tbody>
              {banco.transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <Td>
                    {format(new Date(transaction.date), "dd/MM/yyyy", {
                      locale: es,
                    })}
                  </Td>
                  <Td>
                    <TransactionType type={transaction.type}>
                      {transaction.type === "INGRESO" ? (
                        <ArrowUpRight size={16} />
                      ) : (
                        <ArrowDownLeft size={16} />
                      )}
                      {transaction.type}
                    </TransactionType>
                  </Td>
                  <Td>{transaction.description}</Td>
                  <Td>{transaction.transactionNumber}</Td>
                  <Td align="right">
                    <Amount type={transaction.type}>
                      {new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      }).format(transaction.amount)}
                    </Amount>
                  </Td>
                  <Td>
                    <Category>{transaction.category}</Category>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      </Section>

      {showModal && (
        <ModalTransaccion
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          type={modalType}
          source="BANCO"
        />
      )}
    </Container>
  );
};

// ... (estilos anteriores se mantienen igual) ...

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
`;

const LoadingText = styled.p`
  color: #6b7280;
  font-size: 1rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  color: #6b7280;
`;

const EmptyTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
`;

const EmptyDescription = styled.p`
  color: #6b7280;
  text-align: center;
  max-width: 400px;
`;

const Category = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
  background-color: #f3f4f6;
  color: #374151;
`;

const Container = styled.div`
  padding: 2rem;
  background-color: white;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  ${(props) => {
    switch (props.variant) {
      case "danger":
        return `
          color: #dc2626;
          background-color: #fee2e2;
          &:hover {
            background-color: #fecaca;
          }
        `;
      case "secondary":
        return `
          color: #4b5563;
          background-color: #f3f4f6;
          &:hover {
            background-color: #e5e7eb;
          }
        `;
      default:
        return `
          color: #047857;
          background-color: #d1fae5;
          &:hover {
            background-color: #a7f3d0;
          }
        `;
    }
  }}
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const Card = styled.div`
  background-color: white;
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
`;

const CardHeader = styled.div`
  margin-bottom: 1rem;
`;

const CardTitle = styled.h2`
  font-size: 1rem;
  font-weight: 500;
  color: #6b7280;
`;

const CardContent = styled.div``;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
`;

const TableContainer = styled.div`
  background-color: white;
  overflow: hidden;
  border: 1px solid #e5e7eb;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;

  ${(props) => props.align === "right" && "text-align: right;"}
`;

const Td = styled.td`
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #111827;
  border-bottom: 1px solid #e5e7eb;

  ${(props) => props.align === "right" && "text-align: right;"}
`;

const TransactionType = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;

  ${(props) =>
    props.type === "INGRESO" ? "color: #047857;" : "color: #dc2626;"}
`;

const Amount = styled.span`
  font-weight: 500;

  ${(props) =>
    props.type === "INGRESO" ? "color: #047857;" : "color: #dc2626;"}
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InfoLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
`;

const InfoValue = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: #111827;
`;

export default Bancos;
