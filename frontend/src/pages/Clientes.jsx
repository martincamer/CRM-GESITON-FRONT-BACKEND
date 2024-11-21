import { useState, useEffect } from "react";
import { useClientes } from "../context/ClientesContext";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Download,
  Upload,
  Eye,
} from "lucide-react";
import Modal from "../components/Modal/Modal";
import FormularioCliente from "../components/clientes/FormularioCliente";
import useModal from "../hooks/useModal";
import ModalEliminarCliente from "../components/clientes/ModalEliminarCliente";
import { Link } from "react-router-dom";

const Clientes = () => {
  const {
    clientes,
    loading,
    getClientes,
    deleteCliente,
    TIPOS_DOCUMENTO,
    CONDICIONES_FISCALES,
  } = useClientes();

  const [searchTerm, setSearchTerm] = useState("");
  const [filtros, setFiltros] = useState({
    documentType: "",
    taxCondition: "",
    estado: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [clienteEditar, setClienteEditar] = useState(null);
  const [clienteEliminar, setClienteEliminar] = useState(null);

  const { modalStates, openModal, closeModal } = useModal([
    "createClient",
    "editClient",
    "deleteClient",
  ]);

  useEffect(() => {
    getClientes();
  }, []);

  useEffect(() => {
    if (!Array.isArray(clientes)) return;

    const filtered = clientes.filter((cliente) => {
      if (!cliente) return false;

      const matchSearch =
        cliente.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.documentNumber.includes(searchTerm);
      const matchTipo =
        !filtros.documentType || cliente.documentType === filtros.documentType;
      const matchCondicion =
        !filtros.taxCondition || cliente.taxCondition === filtros.taxCondition;
      const matchEstado =
        !filtros.estado ||
        (filtros.estado === "active" ? cliente.isActive : !cliente.isActive);

      return matchSearch && matchTipo && matchCondicion && matchEstado;
    });

    setClientesFiltrados(filtered);
  }, [searchTerm, filtros, clientes]);

  const handleEdit = (cliente) => {
    setClienteEditar(cliente);
    openModal("editClient");
  };

  const handleCloseEdit = () => {
    setClienteEditar(null);
    closeModal("editClient");
  };

  const handleDeleteClick = (cliente) => {
    setClienteEliminar(cliente);
    openModal("deleteClient");
  };

  const handleConfirmDelete = async (id) => {
    const result = await deleteCliente(id);
    if (result.success) {
      setClienteEliminar(null);
      closeModal("deleteClient");
    }
  };

  const handleCancelDelete = () => {
    setClienteEliminar(null);
    closeModal("deleteClient");
  };

  return (
    <div className="p-6 bg-white h-full min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Clientes</h1>
        <div className="flex gap-3">
          <button
            onClick={() => openModal("createClient")}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
          >
            <Plus size={20} />
            Nuevo Cliente
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
              placeholder="Buscar clientes..."
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
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 border border-gray-200 mb-4">
            <select
              className="border border-gray-200 p-2 w-full focus:outline-none focus:border-blue-500"
              value={filtros.documentType}
              onChange={(e) =>
                setFiltros({ ...filtros, documentType: e.target.value })
              }
            >
              <option value="">Todos los tipos de documento</option>
              {TIPOS_DOCUMENTO.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>

            <select
              className="border border-gray-200 p-2 w-full focus:outline-none focus:border-blue-500"
              value={filtros.taxCondition}
              onChange={(e) =>
                setFiltros({ ...filtros, taxCondition: e.target.value })
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
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-500">
                Razón Social
              </th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-500">
                Documento
              </th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-500">
                Condición Fiscal
              </th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-500">
                Teléfono
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
                  Cargando clientes...
                </td>
              </tr>
            ) : !Array.isArray(clientesFiltrados) ||
              clientesFiltrados.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                  No se encontraron clientes
                </td>
              </tr>
            ) : (
              clientesFiltrados.map((cliente) => (
                <tr key={cliente._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {cliente.businessName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {cliente.documentType}: {cliente.documentNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {
                      CONDICIONES_FISCALES.find(
                        (c) => c.value === cliente.taxCondition
                      )?.label
                    }
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {cliente.contact?.phone || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex px-2 text-xs font-semibold leading-5 ${
                        cliente.isActive
                          ? "text-green-800 bg-green-100"
                          : "text-red-800 bg-red-100"
                      }`}
                    >
                      {cliente.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        className="text-gray-400 hover:text-blue-500"
                        to={`/ventas/clientes/${cliente._id}`}
                      >
                        <Eye size={18} />
                      </Link>
                      <button
                        className="text-gray-400 hover:text-blue-500"
                        title="Editar"
                        onClick={() => handleEdit(cliente)}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        className="text-gray-400 hover:text-red-500"
                        title="Eliminar"
                        onClick={() => handleDeleteClick(cliente)}
                      >
                        <Trash2 size={18} />
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
        isOpen={modalStates.createClient}
        onClose={() => closeModal("createClient")}
        title="Crear Nuevo Cliente"
        width="800px"
      >
        <FormularioCliente onClose={() => closeModal("createClient")} />
      </Modal>

      <Modal
        isOpen={modalStates.editClient}
        onClose={handleCloseEdit}
        title="Editar Cliente"
        width="800px"
      >
        <FormularioCliente cliente={clienteEditar} onClose={handleCloseEdit} />
      </Modal>

      <Modal
        isOpen={modalStates.deleteClient}
        onClose={handleCancelDelete}
        title=""
        width="400px"
      >
        <ModalEliminarCliente
          cliente={clienteEliminar}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      </Modal>
    </div>
  );
};

export default Clientes;
