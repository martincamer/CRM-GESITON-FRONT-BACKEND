import { useState } from "react";
import styled from "styled-components";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useCajaBanco } from "../context/CajaBancoContext";
import ModalTransaccion from "../components/finanzas/ModalTransaccion";

const Cajas = () => {
  const { caja, loading } = useCajaBanco();
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
        <LoadingText>Cargando datos de caja...</LoadingText>
      </LoadingContainer>
    );
  }

  if (!caja) {
    return (
      <EmptyState>
        <Wallet size={48} />
        <EmptyTitle>No hay caja configurada</EmptyTitle>
        <EmptyDescription>
          Contacta al administrador para configurar tu caja.
        </EmptyDescription>
      </EmptyState>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <Wallet size={24} />
          Caja
        </Title>
        <HeaderActions>
          <Button onClick={() => handleOpenModal("INGRESO")}>
            <ArrowUpRight size={18} />
            Ingreso
          </Button>
          <Button variant="danger" onClick={() => handleOpenModal("EGRESO")}>
            <ArrowDownLeft size={18} />
            Egreso
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
            <CardTitle>Balance Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <Balance>
              {new Intl.NumberFormat("es-AR", {
                style: "currency",
                currency: "ARS",
              }).format(caja.balance)}
            </Balance>
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
                <Th>Categoría</Th>
                <Th align="right">Monto</Th>
                <Th>Estado</Th>
              </tr>
            </thead>
            <tbody>
              {caja.transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <Td>
                    {format(new Date(transaction.createdAt), "dd/MM/yyyy", {
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
                  <Td>
                    <Category>{transaction.category}</Category>
                  </Td>
                  <Td align="right">
                    <Amount type={transaction.type}>
                      {new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      }).format(transaction.amount)}
                    </Amount>
                  </Td>
                  <Td>
                    <Status status={transaction.status || "COMPLETADO"}>
                      {transaction.status || "COMPLETADO"}
                    </Status>
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
          source="CAJA"
        />
      )}
    </Container>
  );
};

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
  gap: 0.5rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
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

const Balance = styled.div`
  font-size: 2rem;
  font-weight: 600;
  color: #111827;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
`;

const TableContainer = styled.div`
  background-color: white;
  border: 1px solid #e5e7eb;
  overflow: hidden;
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

const Status = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;

  ${(props) => {
    switch (props.status) {
      case "COMPLETADO":
        return `
          background-color: #d1fae5;
          color: #047857;
        `;
      case "PENDIENTE":
        return `
          background-color: #fef3c7;
          color: #92400e;
        `;
      default:
        return `
          background-color: #f3f4f6;
          color: #374151;
        `;
    }
  }}
`;

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

export default Cajas;
