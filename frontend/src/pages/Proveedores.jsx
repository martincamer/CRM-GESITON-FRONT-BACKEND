import { useState, useEffect } from "react";
import { useCompras } from "../context/ComprasContext";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Download,
  Upload,
  FileText,
  ShoppingBag,
  Eye,
} from "lucide-react";
import Modal from "../components/Modal/Modal";
import FormularioProveedor from "../components/proveedores/FormularioProveedor";
import useModal from "../hooks/useModal";
import { Link } from "react-router-dom";

const Proveedores = () => {
  const { proveedores, loading, getProveedores, CONDICIONES_FISCALES } =
    useCompras();

  const [searchTerm, setSearchTerm] = useState("");
  const [filtros, setFiltros] = useState({
    condicionFiscal: "",
    estado: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [proveedoresFiltrados, setProveedoresFiltrados] = useState([]);
  const [proveedorEditar, setProveedorEditar] = useState(null);

  // Configurar modales
  const { modalStates, openModal, closeModal } = useModal([
    "createSupplier",
    "editSupplier",
    "addInvoice",
    "addPurchaseOrder",
  ]);

  useEffect(() => {
    getProveedores();
  }, []);

  useEffect(() => {
    if (!Array.isArray(proveedores)) return;

    const filtered = proveedores.filter((proveedor) => {
      if (!proveedor) return false;

      const matchSearch =
        proveedor.businessName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        proveedor.cuit.includes(searchTerm);

      const matchCondicion =
        !filtros.condicionFiscal ||
        proveedor.taxCondition === filtros.condicionFiscal;

      const matchEstado =
        !filtros.estado ||
        (filtros.estado === "active"
          ? proveedor.isActive
          : !proveedor.isActive);

      return matchSearch && matchCondicion && matchEstado;
    });

    setProveedoresFiltrados(filtered);
  }, [searchTerm, filtros, proveedores]);

  const handleEdit = (proveedor) => {
    setProveedorEditar(proveedor);
    openModal("editSupplier");
  };

  const handleCloseEdit = () => {
    setProveedorEditar(null);
    closeModal("editSupplier");
  };

  const handleAddInvoice = (proveedor) => {
    setProveedorEditar(proveedor);
    openModal("addInvoice");
  };

  const handleAddPurchaseOrder = (proveedor) => {
    setProveedorEditar(proveedor);
    openModal("addPurchaseOrder");
  };

  return (
    <div className="p-6 bg-white h-full min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Proveedores</h1>
        <div className="flex gap-3">
          <button
            onClick={() => openModal("createSupplier")}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
          >
            <Plus size={20} />
            Nuevo Proveedor
          </button>
          <button className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 hover:bg-gray-200">
            <Download size={20} />
            Exportar
          </button>
          <button className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 hover:bg-gray-200">
            <Upload size={20} />
            Importar
          </button>
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por nombre o CUIT..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 focus:outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-gray-100 px-4 py-2 text-gray-600 hover:bg-gray-200"
          >
            <Filter size={20} />
            Filtros
          </button>
        </div>

        {/* Panel de Filtros */}
        {showFilters && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 border border-gray-200 mb-4">
            <select
              className="border border-gray-200 p-2 w-full focus:outline-none focus:border-blue-500"
              value={filtros.condicionFiscal}
              onChange={(e) =>
                setFiltros({ ...filtros, condicionFiscal: e.target.value })
              }
            >
              <option value="">Todas las condiciones fiscales</option>
              {CONDICIONES_FISCALES.map((condicion) => (
                <option key={condicion.value} value={condicion.value}>
                  {condicion.label}
                </option>
              ))}
            </select>

            <select
              className="border border-gray-200 p-2 w-full focus:outline-none focus:border-blue-500"
              value={filtros.estado}
              onChange={(e) =>
                setFiltros({ ...filtros, estado: e.target.value })
              }
            >
              <option value="">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {" "}
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-500">
                Nombre
              </th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-500">
                Razón Social
              </th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-500">
                CUIT
              </th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-500">
                Condición Fiscal
              </th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-500">
                Saldo
              </th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-500">
                Estado
              </th>
              <th className="border-b px-4 py-3 text-right text-sm font-medium text-gray-500">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-4 py-4 text-center">
                  Cargando proveedores...
                </td>
              </tr>
            ) : !Array.isArray(proveedoresFiltrados) ||
              proveedoresFiltrados.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                  No se encontraron proveedores
                </td>
              </tr>
            ) : (
              proveedoresFiltrados.map((proveedor) => (
                <tr key={proveedor._id} className="hover:bg-gray-50">
                  {" "}
                  <td className="px-4 py-3 text-sm text-gray-900 capitalize">
                    {proveedor.fantasyName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {proveedor.businessName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {proveedor.cuit}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {
                      CONDICIONES_FISCALES.find(
                        (c) => c.value === proveedor.taxCondition
                      )?.label
                    }
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    ${proveedor.balance?.current?.toFixed(2) || "0.00"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex px-2 text-xs font-semibold leading-5 ${
                        proveedor.isActive
                          ? "text-green-800 bg-green-100"
                          : "text-red-800 bg-red-100"
                      }`}
                    >
                      {proveedor.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/compras/proveedores/${proveedor._id}`}
                        className="text-gray-400 hover:text-blue-500"
                        title="Ver detalle"
                      >
                        <Eye size={18} />
                      </Link>
                      <button
                        className="text-gray-400 hover:text-blue-500"
                        title="Agregar Factura"
                        onClick={() => handleAddInvoice(proveedor)}
                      >
                        <FileText size={18} />
                      </button>
                      <button
                        className="text-gray-400 hover:text-blue-500"
                        title="Agregar Orden de Compra"
                        onClick={() => handleAddPurchaseOrder(proveedor)}
                      >
                        <ShoppingBag size={18} />
                      </button>
                      <button
                        className="text-gray-400 hover:text-blue-500"
                        title="Editar"
                        onClick={() => handleEdit(proveedor)}
                      >
                        <Edit2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modales */}
      <Modal
        isOpen={modalStates.createSupplier}
        onClose={() => closeModal("createSupplier")}
        title="Crear Nuevo Proveedor"
        width="800px"
      >
        <FormularioProveedor onClose={() => closeModal("createSupplier")} />
      </Modal>

      <Modal
        isOpen={modalStates.editSupplier}
        onClose={handleCloseEdit}
        title="Editar Proveedor"
        width="800px"
      >
        <FormularioProveedor
          proveedor={proveedorEditar}
          onClose={handleCloseEdit}
        />
      </Modal>

      {/* Agregar aquí los modales para facturas y órdenes de compra */}
    </div>
  );
};

export default Proveedores;
