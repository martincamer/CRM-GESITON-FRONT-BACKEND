import { createContext, useState, useContext, useEffect } from "react";
import clienteAxios from "../config/clienteAxios";
import getConfig from "../helpers/configHeader";

const ProveedoresContext = createContext();

export const ProveedoresProvider = ({ children }) => {
  const [proveedores, setProveedores] = useState([]);
  const [alerta, setAlerta] = useState({});

  const obtenerProveedores = async () => {
    try {
      const config = getConfig();
      if (!config) return;

      const { data } = await clienteAxios("/proveedores", config);
      setProveedores(data);
    } catch (error) {
      console.log(error);
    }
  };

  const obtenerProveedor = async (id) => {
    try {
      const config = getConfig();
      if (!config) return;

      const { data } = await clienteAxios(`/proveedores/${id}`, config);
      return data;
    } catch (error) {
      console.log(error);
      setAlerta({
        msg: error.response?.data?.msg || "Error al obtener el proveedor",
        error: true,
      });
    }
  };

  const crearProveedor = async (proveedor) => {
    try {
      const config = getConfig();
      if (!config) return;

      const { data } = await clienteAxios.post(
        "/proveedores",
        proveedor,
        config
      );
      setProveedores([...proveedores, data]);
      setAlerta({
        msg: "Proveedor creado correctamente",
        error: false,
      });
    } catch (error) {
      console.log(error);
      setAlerta({
        msg: error.response?.data?.msg || "Error al crear el proveedor",
        error: true,
      });
    }
  };

  const actualizarProveedor = async (id, proveedor) => {
    try {
      const config = getConfig();
      if (!config) return;

      const { data } = await clienteAxios.put(
        `/proveedores/${id}`,
        proveedor,
        config
      );
      setProveedores(proveedores.map((p) => (p._id === id ? data : p)));
      setAlerta({
        msg: "Proveedor actualizado correctamente",
        error: false,
      });
    } catch (error) {
      console.log(error);
      setAlerta({
        msg: error.response?.data?.msg || "Error al actualizar el proveedor",
        error: true,
      });
    }
  };

  const eliminarProveedor = async (id) => {
    try {
      const config = getConfig();
      if (!config) return;

      await clienteAxios.delete(`/proveedores/${id}`, config);
      setProveedores(proveedores.filter((p) => p._id !== id));
      setAlerta({
        msg: "Proveedor eliminado correctamente",
        error: false,
      });
    } catch (error) {
      console.log(error);
      setAlerta({
        msg: error.response?.data?.msg || "Error al eliminar el proveedor",
        error: true,
      });
    }
  };

  useEffect(() => {
    obtenerProveedores();
  }, []);

  return (
    <ProveedoresContext.Provider
      value={{
        proveedores,
        alerta,
        setAlerta,
        obtenerProveedores,
        obtenerProveedor,
        crearProveedor,
        actualizarProveedor,
        eliminarProveedor,
      }}
    >
      {children}
    </ProveedoresContext.Provider>
  );
};

export const useProveedores = () => useContext(ProveedoresContext);
