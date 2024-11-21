import { useState } from "react";
import styled from "styled-components";
import { FileText, Download, Eye, Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const TablaFacturas = ({
  facturas,
  onAddInvoice,
  onEdit,
  onDelete,
  onView,
}) => {
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });

  const sortedFacturas = [...facturas].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const getStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case "PAGADA":
      case "PAID":
        return "Pagada";
      case "PENDIENTE":
      case "PENDING":
        return "Pendiente";
      case "VENCIDA":
      case "OVERDUE":
        return "Vencida";
      case "CANCELADA":
      case "CANCELLED":
        return "Cancelada";
      default:
        return status || "Desconocido";
    }
  };

  const getStatusVariant = (status) => {
    switch (status?.toUpperCase()) {
      case "PAGADA":
      case "PAID":
        return "success";
      case "PENDIENTE":
      case "PENDING":
        return "warning";
      case "VENCIDA":
      case "OVERDUE":
        return "error";
      case "CANCELADA":
      case "CANCELLED":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <Container>
      <Header>
        <Title>
          <FileText size={20} />
          Facturas
        </Title>
        <HeaderActions>
          <Button onClick={() => onAddInvoice()}>
            <FileText size={18} />
            Nueva Factura
          </Button>
          <Button variant="secondary">
            <Download size={18} />
            Exportar
          </Button>
        </HeaderActions>
      </Header>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th onClick={() => handleSort("invoiceNumber")}>
                Número
                {sortConfig.key === "invoiceNumber" && (
                  <SortIndicator>
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </SortIndicator>
                )}
              </Th>
              <Th onClick={() => handleSort("date")}>
                Fecha
                {sortConfig.key === "date" && (
                  <SortIndicator>
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </SortIndicator>
                )}
              </Th>
              <Th>Tipo</Th>
              <Th onClick={() => handleSort("total")} align="right">
                Total
                {sortConfig.key === "total" && (
                  <SortIndicator>
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </SortIndicator>
                )}
              </Th>
              <Th>Estado</Th>
              <Th>Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {sortedFacturas.length === 0 ? (
              <tr>
                <Td colSpan="6" align="center">
                  No hay facturas registradas
                </Td>
              </tr>
            ) : (
              sortedFacturas.map((factura) => (
                <tr key={factura._id}>
                  <Td>{factura.invoiceNumber}</Td>
                  <Td>
                    {format(new Date(factura.date), "dd/MM/yyyy", {
                      locale: es,
                    })}
                  </Td>
                  <Td>Factura {factura.invoiceType}</Td>
                  <Td align="right">{formatCurrency(factura.total)}</Td>
                  <Td>
                    <StatusBadge
                      variant={getStatusVariant(factura.paymentStatus)}
                    >
                      {getStatusText(factura.paymentStatus)}
                    </StatusBadge>
                  </Td>
                  <Td>
                    <Actions>
                      <ActionButton
                        title="Ver detalle"
                        onClick={() => onView(factura)}
                      >
                        <Eye size={18} />
                      </ActionButton>
                      <ActionButton
                        title="Editar"
                        onClick={() => onEdit(factura)}
                      >
                        <Edit2 size={18} />
                      </ActionButton>
                      <ActionButton
                        title="Eliminar"
                        variant="danger"
                        onClick={() => onDelete(factura)}
                      >
                        <Trash2 size={18} />
                      </ActionButton>
                    </Actions>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  );
};

// Estilos
const Container = styled.div`
  background-color: white;
  border-radius: 0px;
  border: 1px solid #e5e7eb;
  //   box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

const Title = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s;

  ${(props) =>
    props.variant === "secondary"
      ? `
    color: #374151;
    background-color: white;
    border: 1px solid #d1d5db;
    &:hover {
      background-color: #f3f4f6;
    }
  `
      : `
    color: white;
    background-color: #3b82f6;
    border: 1px solid transparent;
    &:hover {
      background-color: #2563eb;
    }
  `}
`;

const TableContainer = styled.div`
  overflow-x: auto;
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
  cursor: pointer;
  user-select: none;

  &:hover {
    color: #111827;
  }

  ${(props) => props.align === "right" && "text-align: right;"}
`;

const Td = styled.td`
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #111827;
  border-top: 1px solid #e5e7eb;

  ${(props) => props.align === "right" && "text-align: right;"}
  ${(props) => props.align === "center" && "text-align: center;"}
`;

const SortIndicator = styled.span`
  margin-left: 0.25rem;
  color: #3b82f6;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;

  ${(props) => {
    switch (props.variant) {
      case "success":
        return `
          background-color: #dcfce7;
          color: #166534;
        `;
      case "warning":
        return `
          background-color: #fef9c3;
          color: #854d0e;
        `;
      case "error":
        return `
          background-color: #fee2e2;
          color: #991b1b;
        `;
      default:
        return `
          background-color: #f3f4f6;
          color: #374151;
        `;
    }
  }}
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  padding: 0.25rem;
  color: ${(props) => (props.variant === "danger" ? "#ef4444" : "#6b7280")};
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    color: ${(props) => (props.variant === "danger" ? "#dc2626" : "#111827")};
    background-color: ${(props) =>
      props.variant === "danger" ? "#fee2e2" : "#f3f4f6"};
  }
`;

export default TablaFacturas;
