import { createContext, useContext, useState } from "react";
import clienteAxios from "../config/clienteAxios";
import getConfig from "../helpers/configHeader";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

const ComprasContext = createContext();

export const METODOS_PAGO = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "OTROS", label: "Otros" },
];

export const ComprasProvider = ({ children }) => {
  const [proveedor, setProveedor] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { auth } = useAuth();

  // Constantes
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

  // Obtener todos los proveedores
  const getProveedores = async () => {
    const loadingToast = toast.loading("Cargando proveedores...");
    try {
      setLoading(true);
      setError(null);
      const { data } = await clienteAxios.get("/suppliers", getConfig());
      setProveedores(data.suppliers);
      toast.success("Proveedores cargados exitosamente");
    } catch (error) {
      const errorMessage =
        error.response?.data.message || "Error al obtener los proveedores";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  // Obtener un proveedor específico
  const getProveedor = async (id) => {
    const loadingToast = toast.loading("Cargando proveedor...");
    try {
      setLoading(true);
      setError(null);
      const { data } = await clienteAxios.get(`/suppliers/${id}`, getConfig());
      setProveedor(data.supplier);
    } catch (error) {
      const errorMessage =
        error.response?.data.message || "Error al obtener el proveedor";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  // Crear nuevo proveedor
  const createProveedor = async (proveedorData) => {
    const loadingToast = toast.loading("Creando proveedor...");
    try {
      const { data } = await clienteAxios.post(
        "/suppliers",
        proveedorData,
        getConfig()
      );

      if (data.ok) {
        setProveedores([...proveedores, data.supplier]);
        toast.success("Proveedor creado exitosamente");
        return { success: true, data: data.supplier };
      }

      throw new Error(data.message || "Error al crear el proveedor");
    } catch (error) {
      console.error("Error:", error);

      if (error.response?.data?.code === 11000) {
        return {
          success: false,
          message: "Ya existe un proveedor con este CUIT",
          field: "cuit",
          type: "duplicate",
        };
      }

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al crear el proveedor";

      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  // Agregar factura a proveedor
  const addFactura = async (proveedorId, facturaData) => {
    const loadingToast = toast.loading("Agregando factura...");
    try {
      const { data } = await clienteAxios.post(
        `/suppliers/${proveedorId}/invoices`,
        facturaData,
        getConfig()
      );

      if (data.ok) {
        setProveedor(data.invoice);
        toast.success("Factura agregada exitosamente");
        return { success: true, data: data.invoice };
      }

      throw new Error(data.message || "Error al agregar la factura");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al agregar la factura";

      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  // Agregar orden de compra
  const addOrdenCompra = async (proveedorId, ordenData) => {
    const loadingToast = toast.loading("Agregando orden de compra...");
    try {
      const { data } = await clienteAxios.post(
        `/suppliers/${proveedorId}/purchase-orders`,
        ordenData,
        getConfig()
      );

      if (data.ok) {
        const proveedorActualizado = proveedores.map((p) => {
          if (p._id === proveedorId) {
            return {
              ...p,
              documents: {
                ...p.documents,
                purchaseOrders: [
                  ...p.documents.purchaseOrders,
                  data.purchaseOrder,
                ],
              },
            };
          }
          return p;
        });

        setProveedores(proveedorActualizado);
        toast.success("Orden de compra agregada exitosamente");
        return { success: true, data: data.purchaseOrder };
      }

      throw new Error(data.message || "Error al agregar la orden de compra");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al agregar la orden de compra";

      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  // Actualizar proveedor
  const updateProveedor = async (id, proveedorData) => {
    const loadingToast = toast.loading("Actualizando proveedor...");
    try {
      const { data } = await clienteAxios.put(
        `/suppliers/${id}`,
        proveedorData,
        getConfig()
      );

      if (data.ok) {
        setProveedores(
          proveedores.map((p) => (p._id === id ? data.supplier : p))
        );
        toast.success("Proveedor actualizado exitosamente");
        return { success: true, data: data.supplier };
      }

      throw new Error(data.message || "Error al actualizar el proveedor");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al actualizar el proveedor";

      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  // Actualizar orden de compra
  const updateOrdenCompra = async (proveedorId, ordenId, ordenData) => {
    const loadingToast = toast.loading("Actualizando orden de compra...");
    try {
      const { data } = await clienteAxios.put(
        `/suppliers/${proveedorId}/purchase-orders/${ordenId}`,
        ordenData,
        getConfig()
      );

      if (data.ok) {
        const proveedorActualizado = proveedores.map((p) => {
          if (p._id === proveedorId) {
            return {
              ...p,
              documents: {
                ...p.documents,
                purchaseOrders: p.documents.purchaseOrders.map((orden) =>
                  orden._id === ordenId ? data.purchaseOrder : orden
                ),
              },
            };
          }
          return p;
        });

        setProveedores(proveedorActualizado);
        toast.success("Orden de compra actualizada exitosamente");
        return { success: true, data: data.purchaseOrder };
      }

      throw new Error(data.message || "Error al actualizar la orden de compra");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al actualizar la orden de compra";

      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  // const createPagoProveedor = async (supplierId, pagoData) => {
  //   if (!supplierId) {
  //     console.error("ID de proveedor no proporcionado");
  //     throw new Error("ID de proveedor no válido");
  //   }

  //   const loadingToast = toast.loading("Registrando pago...");
  //   try {
  //     console.log("URL de la petición:", `/suppliers/${supplierId}/payments`); // Para debug

  //     const { data } = await clienteAxios.post(
  //       `/suppliers/${supplierId}/payments`,
  //       pagoData,
  //       getConfig()
  //     );

  //     toast.success("Pago registrado exitosamente");
  //     return { success: true, data: data.payment };
  //   } catch (error) {
  //     console.error("Error al registrar pago:", error);
  //     const errorMessage =
  //       error.response?.data?.message || "Error al registrar el pago";
  //     toast.error(errorMessage);
  //     throw error;
  //   } finally {
  //     toast.dismiss(loadingToast);
  //   }
  // };

  const createPagoProveedor = async (providerId, pagoData) => {
    try {
      // Validar datos antes de enviar
      if (!providerId || !pagoData.amount || !pagoData.invoices?.length) {
        throw new Error("Datos incompletos para el pago");
      }

      // Asegurar que los montos sean números
      const datosValidados = {
        ...pagoData,
        amount: parseFloat(pagoData.amount),
        invoices: pagoData.invoices.map((inv) => ({
          ...inv,
          amount: parseFloat(inv.amount),
        })),
      };

      const { data } = await clienteAxios.post(
        `/suppliers/${providerId}/payments`,
        datosValidados,
        getConfig()
      );

      // Actualizar el estado del proveedor
      if (data.supplier) {
        setProveedor(data.supplier);
      }

      return { success: true, data };
    } catch (error) {
      console.error("Error detallado:", error);
      throw error;
    }
  };

  return (
    <ComprasContext.Provider
      value={{
        proveedor,
        proveedores,
        loading,
        error,
        CONDICIONES_FISCALES,
        TIPOS_FACTURA,
        METODOS_PAGO,
        getProveedores,
        getProveedor,
        createProveedor,
        updateProveedor,
        addFactura,
        addOrdenCompra,
        updateOrdenCompra,
        setError,
        createPagoProveedor,
      }}
    >
      {children}
    </ComprasContext.Provider>
  );
};

// Hook personalizado
export const useCompras = () => {
  const context = useContext(ComprasContext);
  if (!context) {
    throw new Error("useCompras debe usarse dentro de ComprasProvider");
  }
  return context;
};

export default ComprasContext;
