import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Store,
  ArrowRightLeft,
  BarChart3,
  Users,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import styled from "styled-components";

const SidebarContainer = styled.div`
  background-color: #ffffff;
  color: #374151;
  transition: all 0.3s ease-in-out;
  height: 100vh;
  width: ${(props) => (props.isOpen ? "280px" : "0")};
  visibility: ${(props) => (props.isOpen ? "visible" : "hidden")};
  border-right: 1px solid #e5e7eb;
  box-shadow: 4px 0 8px -2px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;

  /* Estilizar scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #e5e7eb;
    border-radius: 3px;
    &:hover {
      background-color: #d1d5db;
    }
  }

  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
`;

const NavContainer = styled.nav`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 1rem;

  /* Estilizar scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #e5e7eb;
    border-radius: 3px;
    &:hover {
      background-color: #d1d5db;
    }
  }

  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
`;

const Logo = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #ffffff;
  margin: 0;
`;

const MenuButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  transition: all 0.2s ease-in-out;
  border-left: 3px solid transparent;
  background-color: transparent;
  color: #6b7280;

  &:hover {
    background-color: #f3f4f6;
    color: #1f2937;
    border-left-color: #3b82f6;
  }

  ${(props) =>
    props.active &&
    `
    background-color: #f3f4f6;
    color: #1f2937;
    border-left-color: #3b82f6;
  `}
`;

const SubMenuItem = styled(Link)`
  display: block;
  padding: 0.75rem 1rem 0.75rem 3.25rem;
  color: #6b7280;
  transition: all 0.2s ease-in-out;
  border-left: 3px solid transparent;
  font-size: 0.875rem;
  background-color: #ffff;
  &:hover {
    background-color: #f3f4f6;
    color: #1f2937;
    border-left-color: #3b82f6;
  }

  &.active {
    background-color: #f3f4f6;
    color: #1f2937;
    border-left-color: #3b82f6;
  }
`;

const MenuSection = styled.div`
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    border-bottom: none;
  }
`;

const MenuItem = ({
  icon: Icon,
  label,
  isOpen,
  children,
  defaultOpen = false,
  active = false,
}) => {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(defaultOpen);

  if (!isOpen) return null;

  return (
    <div>
      <MenuButton
        active={active}
        onClick={() => setIsSubmenuOpen(!isSubmenuOpen)}
      >
        <Icon size={20} strokeWidth={1.5} />
        <span className="flex-1 text-left">{label}</span>
        {children && (
          <ChevronDown
            size={16}
            strokeWidth={1.5}
            className={`transition-transform ${
              isSubmenuOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </MenuButton>
      {isSubmenuOpen && children && (
        <div className="bg-gray-50">{children}</div>
      )}
    </div>
  );
};

const Sidebar = ({ isOpen }) => {
  const { logout } = useAuth();

  return (
    <SidebarContainer isOpen={isOpen}>
      <Logo isOpen={isOpen}>Cedbillage</Logo>

      <NavContainer>
        <MenuSection>
          <MenuItem
            icon={LayoutDashboard}
            label="Panel Principal"
            isOpen={isOpen}
            active
          >
            <SubMenuItem to="/dashboard">Inicio</SubMenuItem>
          </MenuItem>
        </MenuSection>

        <MenuSection>
          <MenuItem icon={Package} label="Inventario" isOpen={isOpen}>
            <SubMenuItem to="/inventario/productos">Productos</SubMenuItem>
            {/* <SubMenuItem to="/inventario/categorias">Categorías</SubMenuItem>
            <SubMenuItem to="/inventario/movimientos">Movimientos</SubMenuItem> */}
          </MenuItem>

          <MenuItem icon={ShoppingCart} label="Compras" isOpen={isOpen}>
            {/* <SubMenuItem to="/compras/ordenes">Órdenes de Compra</SubMenuItem> */}
            <SubMenuItem to="/compras/proveedores">Proveedores</SubMenuItem>
            {/* <SubMenuItem to="/compras/facturas">Facturas</SubMenuItem>
            <SubMenuItem to="/compras/notas-debito">
              Notas de Débito
            </SubMenuItem> */}
          </MenuItem>

          <MenuItem icon={Store} label="Ventas" isOpen={isOpen}>
            <SubMenuItem to="/ventas/clientes">Clientes</SubMenuItem>
            {/* <SubMenuItem to="/ventas/facturacion">Facturación</SubMenuItem>
            <SubMenuItem to="/ventas/pagos">Pagos</SubMenuItem>
            <SubMenuItem to="/ventas/cotizaciones">Cotizaciones</SubMenuItem> */}
          </MenuItem>
        </MenuSection>

        <MenuSection>
          <MenuItem icon={ArrowRightLeft} label="Transacciones" isOpen={isOpen}>
            <SubMenuItem to="/transacciones/bancos">Bancos</SubMenuItem>
            <SubMenuItem to="/transacciones/cajas">Cajas</SubMenuItem>
            {/* <SubMenuItem to="/transacciones/entradas">Entradas</SubMenuItem>
            <SubMenuItem to="/transacciones/salidas">Salidas</SubMenuItem>
            <SubMenuItem to="/transacciones/transferencias">
              Transferencias
            </SubMenuItem> */}
          </MenuItem>

          <MenuItem icon={BarChart3} label="Reportes" isOpen={isOpen}>
            <SubMenuItem to="/reportes/ventas">Ventas</SubMenuItem>
            <SubMenuItem to="/reportes/compras">Compras</SubMenuItem>
            <SubMenuItem to="/reportes/inventario">Inventario</SubMenuItem>
          </MenuItem>
        </MenuSection>

        <MenuSection>
          {/* <MenuItem icon={Users} label="Usuarios" isOpen={isOpen} /> */}
          <MenuItem
            to="/profile"
            icon={Settings}
            label="Configuración"
            isOpen={isOpen}
          >
            <SubMenuItem to="/profile">Perfil</SubMenuItem>
          </MenuItem>

          <MenuButton
            onClick={logout}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut size={20} strokeWidth={1.5} />
            <span className="flex-1 text-left">Cerrar Sesión</span>
          </MenuButton>
        </MenuSection>
      </NavContainer>
    </SidebarContainer>
  );
};

export default Sidebar;
