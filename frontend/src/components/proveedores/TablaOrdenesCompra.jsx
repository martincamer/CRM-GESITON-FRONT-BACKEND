import { useState } from "react";
import styled from "styled-components";
import {
  ShoppingBag,
  Download,
  Eye,
  Edit2,
  Trash2,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const TablaOrdenesCompra = ({
  ordenes = [],
  onAddOrder,
  onEdit,
  onDelete,
  onView,
  onCreateInvoice,
}) => {
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });

  const formatDate = (dateString) => {
    try {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      // Validar que la fecha sea válida
      if (isNaN(date.getTime())) return "Fecha inválida";
      return format(date, "dd/MM/yyyy", { locale: es });
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return "Error en fecha";
    }
  };

  const formatCurrency = (amount) => {
    try {
      if (!amount && amount !== 0) return "N/A";
      return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
      }).format(amount);
    } catch (error) {
      console.error("Error al formatear moneda:", error);
      return "Error";
    }
  };

  const sortedOrdenes = [...ordenes].sort((a, b) => {
    if (!a[sortConfig.key] || !b[sortConfig.key]) return 0;
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

  const getStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case "COMPLETADA":
      case "COMPLETED":
        return "Completada";
      case "PENDIENTE":
      case "PENDING":
        return "Pendiente";
      case "PARCIAL":
      case "PARTIAL":
        return "Parcial";
      case "CANCELADA":
      case "CANCELLED":
        return "Cancelada";
      default:
        return status || "Desconocido";
    }
  };

  const getStatusVariant = (status) => {
    switch (status?.toUpperCase()) {
      case "COMPLETADA":
      case "COMPLETED":
        return "success";
      case "PENDIENTE":
      case "PENDING":
        return "warning";
      case "PARCIAL":
      case "PARTIAL":
        return "info";
      case "CANCELADA":
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Container>
      <Header>
        <Title>
          <ShoppingBag size={20} />
          Órdenes de Compra
        </Title>
        <HeaderActions>
          <Button onClick={onAddOrder}>
            <ShoppingBag size={18} />
            Nueva Orden
          </Button>
          <Button variant="secondary">
            <Download size={18} />
            Exportar
          </Button>
        </HeaderActions>
      </Header>

      <TableContainer>
        {ordenes.length === 0 ? (
          <EmptyState>No hay órdenes de compra registradas</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th onClick={() => handleSort("orderNumber")}>
                  Número
                  {sortConfig.key === "orderNumber" && (
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
                <Th onClick={() => handleSort("deliveryDate")}>
                  Entrega
                  {sortConfig.key === "deliveryDate" && (
                    <SortIndicator>
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </SortIndicator>
                  )}
                </Th>
                <Th onClick={() => handleSort("total")}>
                  Total
                  {sortConfig.key === "total" && (
                    <SortIndicator>
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </SortIndicator>
                  )}
                </Th>
                <Th onClick={() => handleSort("status")}>
                  Estado
                  {sortConfig.key === "status" && (
                    <SortIndicator>
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </SortIndicator>
                  )}
                </Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {sortedOrdenes.map((orden) => (
                <tr key={orden._id}>
                  <Td>{orden.orderNumber}</Td>
                  <Td>{formatDate(orden.date)}</Td>
                  <Td>{formatDate(orden.deliveryDate)}</Td>
                  <Td>{formatCurrency(orden.total)}</Td>
                  <Td>
                    <Status variant={getStatusVariant(orden.status)}>
                      {getStatusText(orden.status)}
                    </Status>
                  </Td>
                  <Td>
                    <Actions>
                      <ActionButton
                        onClick={() => onCreateInvoice(orden)}
                        disabled={
                          orden.status?.toUpperCase() === "COMPLETADA" ||
                          orden.status?.toUpperCase() === "COMPLETED"
                        }
                        variant="success"
                        title={
                          orden.status?.toUpperCase() === "COMPLETADA" ||
                          orden.status?.toUpperCase() === "COMPLETED"
                            ? "Ya existe una factura para esta orden"
                            : "Crear factura"
                        }
                      >
                        <FileText size={16} />
                      </ActionButton>
                      <ActionButton onClick={() => onView(orden)}>
                        <Eye size={16} />
                      </ActionButton>
                      <ActionButton onClick={() => onEdit(orden)}>
                        <Edit2 size={16} />
                      </ActionButton>
                      <ActionButton
                        variant="danger"
                        onClick={() => onDelete(orden)}
                      >
                        <Trash2 size={16} />
                      </ActionButton>
                    </Actions>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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

const Status = styled.span`
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
      case "info":
        return `
          background-color: #dbeafe;
          color: #1e40af;
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
  color: ${(props) => {
    if (props.variant === "danger") return "#ef4444";
    if (props.variant === "success") return "#10b981";
    return "#6b7280";
  }};
  border-radius: 4px;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    color: ${(props) => {
      if (props.variant === "danger") return "#dc2626";
      if (props.variant === "success") return "#059669";
      return "#111827";
    }};
    background-color: ${(props) => {
      if (props.variant === "danger") return "#fee2e2";
      if (props.variant === "success") return "#d1fae5";
      return "#f3f4f6";
    }};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  padding: 1rem;
  text-align: center;
  color: #6b7280;
`;

export default TablaOrdenesCompra;
