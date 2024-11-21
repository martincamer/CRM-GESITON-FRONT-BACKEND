import { createContext, useState, useContext } from "react";
import clienteAxios from "../config/clienteAxios";
import getConfig from "../helpers/configHeader";
import toast from "react-hot-toast";

const ClientesContext = createContext();

export const ClientesProvider = ({ children }) => {
  const [clientes, setClientes] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Constantes
  const TIPOS_DOCUMENTO = [
    { value: "DNI", label: "DNI" },
    { value: "CUIT", label: "CUIT" },
    { value: "CUIL", label: "CUIL" },
  ];

  const CONDICIONES_FISCALES = [
    { value: "RESPONSABLE_INSCRIPTO", label: "Responsable Inscripto" },
    { value: "MONOTRIBUTO", label: "Monotributo" },
    { value: "EXENTO", label: "Exento" },
    { value: "CONSUMIDOR_FINAL", label: "Consumidor Final" },
  ];

  const TIPOS_FACTURA = [
    { value: "A", label: "Factura A" },
    { value: "B", label: "Factura B" },
    { value: "C", label: "Factura C" },
    { value: "M", label: "Factura M" },
    { value: "E", label: "Factura E" },
  ];

  const METODOS_PAGO = [
    { value: "EFECTIVO", label: "Efectivo" },
    { value: "TRANSFERENCIA", label: "Transferencia" },
    { value: "CHEQUE", label: "Cheque" },
    { value: "TARJETA", label: "Tarjeta" },
    { value: "OTROS", label: "Otros" },
  ];

  const TIPOS_NOTA = [
    { value: "DEBITO", label: "Nota de Débito" },
    { value: "CREDITO", label: "Nota de Crédito" },
  ];

  // Obtener todos los clientes
  const getClientes = async () => {
    const loadingToast = toast.loading("Cargando clientes...");
    try {
      setLoading(true);
      setError(null);
      const { data } = await clienteAxios.get("/clients", getConfig());
      setClientes(data.clients);
      toast.success("Clientes cargados exitosamente");
    } catch (error) {
      const errorMessage =
        error.response?.data.message || "Error al obtener los clientes";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  // Obtener un cliente específico
  const getCliente = async (id) => {
    const loadingToast = toast.loading("Cargando cliente...");
    try {
      setLoading(true);
      setError(null);
      const { data } = await clienteAxios.get(`/clients/${id}`, getConfig());
      setCliente(data.client);
    } catch (error) {
      const errorMessage =
        error.response?.data.message || "Error al obtener el cliente";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  // Crear nuevo cliente
  const createCliente = async (clienteData) => {
    const loadingToast = toast.loading("Creando cliente...");
    try {
      const { data } = await clienteAxios.post(
        "/clients",
        clienteData,
        getConfig()
      );

      if (data.ok) {
        setClientes([...clientes, data.client]);
        toast.success("Cliente creado exitosamente");
        return { success: true, data: data.client };
      }

      throw new Error(data.message || "Error al crear el cliente");
    } catch (error) {
      console.error("Error:", error);

      if (error.response?.data?.code === 11000) {
        return {
          success: false,
          message: "Ya existe un cliente con este documento",
          field: "documentNumber",
          type: "duplicate",
        };
      }

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al crear el cliente";

      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  // Actualizar cliente
  const updateCliente = async (id, clienteData) => {
    const loadingToast = toast.loading("Actualizando cliente...");
    try {
      const { data } = await clienteAxios.put(
        `/clients/${id}`,
        clienteData,
        getConfig()
      );

      if (data.ok) {
        setClientes(clientes.map((c) => (c._id === id ? data.client : c)));
        toast.success("Cliente actualizado exitosamente");
        return { success: true, data: data.client };
      }

      throw new Error(data.message || "Error al actualizar el cliente");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al actualizar el cliente";

      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  // Eliminar cliente
  const deleteCliente = async (id) => {
    const loadingToast = toast.loading("Eliminando cliente...");
    try {
      const { data } = await clienteAxios.delete(`/clients/${id}`, getConfig());

      if (data.ok) {
        setClientes(clientes.filter((c) => c._id !== id));
        toast.success("Cliente eliminado exitosamente");
        return { success: true };
      }

      throw new Error(data.message || "Error al eliminar el cliente");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al eliminar el cliente";

      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  // Crear factura para cliente
  const createFactura = async (clienteId, facturaData) => {
    const loadingToast = toast.loading("Creando factura...");
    try {
      const { data } = await clienteAxios.post(
        `/clients/${clienteId}/invoices`,
        facturaData,
        getConfig()
      );

      if (data.ok) {
        setCliente(data.invoice);
        toast.success("Factura creada exitosamente");
        return { success: true, data: data.invoice };
      }

      throw new Error(data.message || "Error al crear la factura");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al crear la factura";

      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  // Crear presupuesto
  const createPresupuesto = async (clienteId, presupuestoData) => {
    const loadingToast = toast.loading("Creando presupuesto...");
    try {
      const { data } = await clienteAxios.post(
        `/clients/${clienteId}/quotes`,
        presupuestoData,
        getConfig()
      );

      if (data.ok) {
        const clienteActualizado = clientes.map((c) => {
          if (c._id === clienteId) {
            return {
              ...c,
              documents: {
                ...c.documents,
                quotes: [...c.documents.quotes, data.quote],
              },
            };
          }
          return c;
        });

        setClientes(clienteActualizado);
        toast.success("Presupuesto creado exitosamente");
        return { success: true, data: data.quote };
      }

      throw new Error(data.message || "Error al crear el presupuesto");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al crear el presupuesto";

      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const createPago = async (clienteId, pagoData) => {
    try {
      const { data } = await clienteAxios.post(
        `/clients/${clienteId}/payments`,
        pagoData,
        getConfig()
      );
      setCliente(data.clienteActualizado);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const getClientInvoices = async (clientId) => {
    try {
      const { data } = await clienteAxios.get(
        `/clients/${clientId}`,
        getConfig()
      );
      // Retornamos solo las facturas pendientes de pago
      return data.client.documents.invoices.filter(
        (inv) => inv.paymentStatus !== "PAGADO"
      );
    } catch (error) {
      console.error("Error al obtener facturas:", error);
      return [];
    }
  };

  const createQuote = async (clienteId, quoteData) => {
    const loadingToast = toast.loading("Creando presupuesto...");
    try {
      const { data } = await clienteAxios.post(
        `/clients/${clienteId}/quotes`,
        quoteData,
        getConfig()
      );

      if (data.ok) {
        setCliente(data.clienteActualizado);
        toast.success("Presupuesto creado exitosamente");
        return { success: true, data: data.quote };
      }

      throw new Error(data.message || "Error al crear el presupuesto");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al crear el presupuesto";

      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const crearNotaDebCred = async (clienteId, notaData) => {
    try {
      const response = await clienteAxios.post(
        `/clients/${clienteId}/notes`,
        notaData,
        getConfig()
      );
      // Actualizar el cliente con la nueva nota
      if (cliente && cliente._id === clienteId) {
        setCliente((prevCliente) => ({
          ...prevCliente,
          documents: {
            ...prevCliente.documents,
            notes: [...(prevCliente.documents.notes || []), response.data],
          },
        }));
      }
      return response.data;
    } catch (error) {
      console.error("Error al crear nota:", error);
      throw error;
    }
  };

  // Agregar función para obtener facturas
  const obtenerFacturasCliente = async (clienteId) => {
    try {
      const response = await clienteAxios.get(
        `/clients/${clienteId}/invoices`,
        getConfig()
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener facturas:", error);
      throw error;
    }
  };

  return (
    <ClientesContext.Provider
      value={{
        clientes,
        cliente,
        loading,
        error,
        TIPOS_DOCUMENTO,
        CONDICIONES_FISCALES,
        TIPOS_FACTURA,
        METODOS_PAGO,
        TIPOS_NOTA,
        getClientes,
        getCliente,
        createCliente,
        updateCliente,
        deleteCliente,
        createFactura,
        createPresupuesto,
        setError,
        createPago,
        getClientInvoices,
        createQuote,
        crearNotaDebCred,
        obtenerFacturasCliente,
      }}
    >
      {children}
    </ClientesContext.Provider>
  );
};

// Hook personalizado
export const useClientes = () => {
  const context = useContext(ClientesContext);
  if (!context) {
    throw new Error("useClientes debe usarse dentro de un ClientesProvider");
  }
  return context;
};

export default ClientesContext;
