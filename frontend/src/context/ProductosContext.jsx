import { createContext, useState, useContext, useEffect } from "react";
import clienteAxios from "../config/clienteAxios";
import getConfig from "../helpers/configHeader";
import toast from "react-hot-toast";

const ProductosContext = createContext();

export const ProductosProvider = ({ children }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [producto, setProducto] = useState([]);

  // Obtener todos los productos
  const getProductos = async () => {
    const loadingToast = toast.loading("Cargando productos...");
    try {
      setLoading(true);
      setError(null);
      const { data } = await clienteAxios.get("/products", getConfig());
      setProductos(data.products);
      toast.success("Productos cargados exitosamente");
    } catch (error) {
      const errorMessage =
        error.response?.data.message || "Error al obtener los productos";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  // Obtener un producto por ID
  const getProducto = async (id) => {
    const loadingToast = toast.loading("Cargando producto...");
    try {
      setLoading(true);
      setError(null);
      const { data } = await clienteAxios.get(`/products/${id}`, getConfig());
      setProducto(data.data);
    } catch (error) {
      const errorMessage =
        error.response?.data.message || "Error al obtener el producto";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  // Crear nuevo producto
  const createProducto = async (productoData) => {
    const loadingToast = toast.loading("Creando producto...");
    try {
      console.log("Datos enviados:", productoData);

      const { data } = await clienteAxios.post(
        "/products",
        productoData,
        getConfig()
      );

      if (data.ok) {
        const productosActuales = Array.isArray(productos) ? productos : [];

        if (data.product) {
          setProductos([...productosActuales, data.product]);
          toast.success("Producto creado exitosamente");
          return { success: true, data: data.product };
        }
      }

      throw new Error(data.message || "Error al crear el producto");
    } catch (error) {
      console.error("Error completo:", error);

      if (
        error.response?.data?.code === 11000 ||
        error.response?.data?.message?.includes("duplicate")
      ) {
        return {
          success: false,
          message: "Ya existe un producto con ese nombre",
          field: "name",
          type: "duplicate",
        };
      }

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al crear el producto";

      toast.error(errorMessage);

      return {
        success: false,
        message: errorMessage,
        error: error.response?.data?.error || error.message,
      };
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  // Actualizar producto
  const updateProducto = async (id, productoData) => {
    const loadingToast = toast.loading("Actualizando producto...");
    try {
      setLoading(true);
      setError(null);
      const { data } = await clienteAxios.put(
        `/products/${id}`,
        productoData,
        getConfig()
      );
      setProductos(productos.map((p) => (p._id === id ? data.product : p)));
      toast.success("Producto actualizado exitosamente");
      return { success: true, message: data.message };
    } catch (error) {
      const errorMessage =
        error.response?.data.message || "Error al actualizar el producto";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  // Desactivar producto (soft delete)
  const deleteProducto = async (id) => {
    const loadingToast = toast.loading("Desactivando producto...");
    try {
      setLoading(true);
      setError(null);

      // Llamar al endpoint de actualización
      const { data } = await clienteAxios.put(
        `/products/${id}`,
        { isActive: false },
        getConfig()
      );

      // Actualizar el estado local
      setProductos(
        productos.map((p) => (p._id === id ? { ...p, isActive: false } : p))
      );

      toast.success("Producto desactivado exitosamente");
      return { success: true, message: data.message };
    } catch (error) {
      const errorMessage =
        error.response?.data.message || "Error al desactivar el producto";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  // Limpiar producto seleccionado
  const clearProducto = () => {
    setProducto(null);
    setError(null);
  };

  // Limpiar error
  const clearError = () => {
    setError(null);
  };

  // Constantes para tipos y unidades
  const TIPOS_PRODUCTO = [
    { value: "VENTA", label: "Venta" },
    { value: "COMPRA", label: "Compra" },
    { value: "AMBOS", label: "Ambos" },
  ];

  const UNIDADES_MEDIDA = [
    { value: "UNIDAD", label: "Unidad" },
    { value: "METRO", label: "Metro" },
    { value: "METRO_CUADRADO", label: "Metro Cuadrado" },
    { value: "METRO_CUBICO", label: "Metro Cúbico" },
    { value: "KILOGRAMO", label: "Kilogramo" },
    { value: "GRAMO", label: "Gramo" },
    { value: "LITRO", label: "Litro" },
    { value: "MILILITRO", label: "Mililitro" },
    { value: "HORA", label: "Hora" },
    { value: "DIA", label: "Día" },
    { value: "KILOMETRO", label: "Kilómetro" },
    { value: "PIEZA", label: "Pieza" },
    { value: "PAQUETE", label: "Paquete" },
    { value: "CAJA", label: "Caja" },
    { value: "DOCENA", label: "Docena" },
  ];

  return (
    <ProductosContext.Provider
      value={{
        productos,
        loading,
        error,
        producto,
        TIPOS_PRODUCTO,
        UNIDADES_MEDIDA,
        getProductos,
        getProducto,
        createProducto,
        updateProducto,
        deleteProducto,
        clearProducto,
        clearError,
      }}
    >
      {children}
    </ProductosContext.Provider>
  );
};

// Hook personalizado
export const useProductos = () => {
  const context = useContext(ProductosContext);
  if (!context) {
    throw new Error("useProductos debe usarse dentro de un ProductosProvider");
  }
  return context;
};

export default ProductosContext;
