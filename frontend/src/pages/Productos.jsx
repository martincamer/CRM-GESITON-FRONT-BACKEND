import { useState, useEffect } from "react";
import { useProductos } from "../context/ProductosContext";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Download,
  Upload,
} from "lucide-react";
import Modal from "../components/Modal/Modal";
import FormularioProducto from "../components/productos/FormularioProducto";
import useModal from "../hooks/useModal";
import ModalEliminarProducto from "../components/productos/ModalEliminarProducto";

const Productos = () => {
  const {
    productos,
    loading,
    getProductos,
    deleteProducto,
    TIPOS_PRODUCTO,
    UNIDADES_MEDIDA,
  } = useProductos();

  const [searchTerm, setSearchTerm] = useState("");
  const [filtros, setFiltros] = useState({
    tipo: "",
    unidad: "",
    estado: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [productoEditar, setProductoEditar] = useState(null);
  const [productoEliminar, setProductoEliminar] = useState(null);

  // Configurar modales
  const { modalStates, openModal, closeModal } = useModal([
    "createProduct",
    "editProduct",
    "deleteProduct",
  ]);

  useEffect(() => {
    getProductos();
  }, []);

  useEffect(() => {
    if (!Array.isArray(productos)) return;

    const filtered = productos.filter((producto) => {
      if (!producto) return false;

      const matchSearch = producto.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchTipo = !filtros.tipo || producto.type === filtros.tipo;
      const matchUnidad = !filtros.unidad || producto.unit === filtros.unidad;
      const matchEstado =
        !filtros.estado ||
        (filtros.estado === "active" ? producto.isActive : !producto.isActive);

      return matchSearch && matchTipo && matchUnidad && matchEstado;
    });

    setProductosFiltrados(filtered);
  }, [searchTerm, filtros, productos]);

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      await deleteProducto(id);
    }
  };

  const handleEdit = (producto) => {
    setProductoEditar(producto);
    openModal("editProduct");
  };

  const handleCloseEdit = () => {
    setProductoEditar(null);
    closeModal("editProduct");
  };

  const handleDeleteClick = (producto) => {
    setProductoEliminar(producto);
    openModal("deleteProduct");
  };

  const handleConfirmDelete = async (id) => {
    const result = await deleteProducto(id);
    if (result.success) {
      setProductoEliminar(null);
      closeModal("deleteProduct");
    }
  };

  const handleCancelDelete = () => {
    setProductoEliminar(null);
    closeModal("deleteProduct");
  };

  console.log("asdasd", productos);

  return (
    <div className="p-6 bg-white h-full min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Productos</h1>
        <div className="flex gap-3">
          <button
            onClick={() => openModal("createProduct")}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
          >
            <Plus size={20} />
            Nuevo Producto
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
              placeholder="Buscar productos..."
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
              value={filtros.tipo}
              onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
            >
              <option value="">Todos los tipos</option>
              {TIPOS_PRODUCTO.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>

            <select
              className="border border-gray-200 p-2 w-full focus:outline-none focus:border-blue-500"
              value={filtros.unidad}
              onChange={(e) =>
                setFiltros({ ...filtros, unidad: e.target.value })
              }
            >
              <option value="">Todas las unidades</option>
              {UNIDADES_MEDIDA.map((unidad) => (
                <option key={unidad.value} value={unidad.value}>
                  {unidad.label}
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
                Nombre
              </th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-500">
                Tipo
              </th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-500">
                Unidad
              </th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-500">
                Precio
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
                  Cargando productos...
                </td>
              </tr>
            ) : !Array.isArray(productosFiltrados) ||
              productosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                  No se encontraron productos
                </td>
              </tr>
            ) : (
              productosFiltrados.map((producto) => (
                <tr key={producto._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {producto.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {
                      TIPOS_PRODUCTO.find((t) => t.value === producto.type)
                        ?.label
                    }
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {
                      UNIDADES_MEDIDA.find((u) => u.value === producto.unit)
                        ?.label
                    }
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    ${producto.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex px-2 text-xs font-semibold leading-5 ${
                        producto.isActive
                          ? "text-green-800 bg-green-100"
                          : "text-red-800 bg-red-100"
                      }`}
                    >
                      {producto.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="text-gray-400 hover:text-blue-500"
                        title="Editar"
                        onClick={() => handleEdit(producto)}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        className="text-gray-400 hover:text-red-500"
                        title="Eliminar"
                        onClick={() => handleDeleteClick(producto)}
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

      {/* Modal Crear Producto */}
      <Modal
        isOpen={modalStates.createProduct}
        onClose={() => closeModal("createProduct")}
        title="Crear Nuevo Producto"
        width="600px"
      >
        <FormularioProducto onClose={() => closeModal("createProduct")} />
      </Modal>

      {/* Modal Editar Producto */}
      <Modal
        isOpen={modalStates.editProduct}
        onClose={handleCloseEdit}
        title="Editar Producto"
        width="600px"
      >
        <FormularioProducto
          producto={productoEditar}
          onClose={handleCloseEdit}
        />
      </Modal>

      {/* Modal Eliminar Producto */}
      <Modal
        isOpen={modalStates.deleteProduct}
        onClose={handleCancelDelete}
        title=""
        width="400px"
      >
        <ModalEliminarProducto
          producto={productoEliminar}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      </Modal>
    </div>
  );
};

export default Productos;
