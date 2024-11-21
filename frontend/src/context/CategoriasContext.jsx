import { createContext, useState, useContext, useEffect } from "react";
import clienteAxios from "../config/clienteAxios";
import getConfig from "../helpers/configHeader";

const CategoriasContext = createContext();

export const CategoriasProvider = ({ children }) => {
  const [categorias, setCategorias] = useState([]);
  const [categoria, setCategoria] = useState({});
  const [loading, setLoading] = useState(false);
  const [alerta, setAlerta] = useState({});

  // Obtener todas las categorías
  const obtenerCategorias = async () => {
    setLoading(true);
    try {
      const config = getConfig();
      if (!config) return;

      const { data } = await clienteAxios("/categorias", config);
      setCategorias(data);
    } catch (error) {
      console.log(error);
      setAlerta({
        msg: error.response?.data?.msg || "Error al obtener categorías",
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Obtener una categoría
  const obtenerCategoria = async (id) => {
    setLoading(true);
    try {
      const config = getConfig();
      if (!config) return;

      const { data } = await clienteAxios(`/categorias/${id}`, config);
      setCategoria(data);
    } catch (error) {
      console.log(error);
      setAlerta({
        msg: error.response?.data?.msg || "Error al obtener la categoría",
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva categoría
  const crearCategoria = async (categoria) => {
    setLoading(true);
    try {
      const config = getConfig();
      if (!config) return;

      const { data } = await clienteAxios.post(
        "/categorias",
        categoria,
        config
      );
      setCategorias([...categorias, data]);
      setAlerta({
        msg: "Categoría creada correctamente",
        error: false,
      });
      return true; // Para manejar el cierre del modal
    } catch (error) {
      console.log(error);
      setAlerta({
        msg: error.response?.data?.msg || "Error al crear la categoría",
        error: true,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar categoría
  const actualizarCategoria = async (id, categoria) => {
    setLoading(true);
    try {
      const config = getConfig();
      if (!config) return;

      const { data } = await clienteAxios.put(
        `/categorias/${id}`,
        categoria,
        config
      );

      const categoriasActualizadas = categorias.map((categoriaState) =>
        categoriaState._id === data._id ? data : categoriaState
      );
      setCategorias(categoriasActualizadas);

      setAlerta({
        msg: "Categoría actualizada correctamente",
        error: false,
      });
      return true;
    } catch (error) {
      console.log(error);
      setAlerta({
        msg: error.response?.data?.msg || "Error al actualizar la categoría",
        error: true,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar categoría
  const eliminarCategoria = async (id) => {
    try {
      const config = getConfig();
      if (!config) return;

      await clienteAxios.delete(`/categorias/${id}`, config);

      const categoriasActualizadas = categorias.filter(
        (categoria) => categoria._id !== id
      );
      setCategorias(categoriasActualizadas);

      setAlerta({
        msg: "Categoría eliminada correctamente",
        error: false,
      });
      return true;
    } catch (error) {
      console.log(error);
      setAlerta({
        msg: error.response?.data?.msg || "Error al eliminar la categoría",
        error: true,
      });
      return false;
    }
  };

  // Cargar categorías al montar el componente
  useEffect(() => {
    obtenerCategorias();
  }, []);

  // Limpiar alerta
  const limpiarAlerta = () => {
    setAlerta({});
  };

  console.log(categorias);

  return (
    <CategoriasContext.Provider
      value={{
        categorias,
        categoria,
        loading,
        alerta,
        obtenerCategorias,
        obtenerCategoria,
        crearCategoria,
        actualizarCategoria,
        eliminarCategoria,
        limpiarAlerta,
      }}
    >
      {children}
    </CategoriasContext.Provider>
  );
};

// Hook personalizado
export const useCategorias = () => {
  return useContext(CategoriasContext);
};

export default CategoriasContext;
