import { createContext, useState, useContext, useEffect } from "react";
import { toast } from "react-hot-toast";
import clienteAxios from "../config/clienteAxios";
import getConfig from "../helpers/configHeader";

const CajaBancoContext = createContext();

export const CajaBancoProvider = ({ children }) => {
  const [caja, setCaja] = useState(null);
  const [banco, setBanco] = useState(null);
  const [alerta, setAlerta] = useState({});
  const [loading, setLoading] = useState(true);

  // Obtener datos iniciales
  const obtenerDatos = async () => {
    try {
      const config = getConfig();
      if (!config) return;

      const [cajaRes, bancoRes] = await Promise.all([
        clienteAxios("/cash", config),
        clienteAxios("/bank", config),
      ]);

      setCaja(cajaRes.data.cash);
      setBanco(bancoRes.data.bank);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setAlerta({
        msg: "Error al cargar los datos financieros",
        error: true,
      });
      setLoading(false);
    }
  };

  // Operaciones de Caja
  const crearTransaccionCaja = async (transaccion) => {
    const loadingToast = toast.loading("Procesando transacción...");
    try {
      const config = getConfig();
      if (!config) {
        toast.error("Error de autenticación");
        return { success: false, error: "No autorizado" };
      }

      const { data } = await clienteAxios.post(
        "/cash/transaction",
        transaccion,
        config
      );

      if (data.ok) {
        setCaja(data.cash);
        toast.success("Transacción realizada exitosamente");
        return { success: true, data: data.cash };
      } else {
        throw new Error(data.message || "Error al procesar la transacción");
      }
    } catch (error) {
      console.error("Error en crearTransaccionCaja:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al procesar la transacción";
      toast.error(errorMessage);
      return {
        success: false,
        error: errorMessage,
        details: error.response?.data?.details,
      };
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  // Operaciones de Banco
  const crearTransaccionBanco = async (transaccion) => {
    try {
      const config = getConfig();
      if (!config) return;

      const { data } = await clienteAxios.post(
        "/bank/transaction",
        transaccion,
        config
      );

      setBanco(data.bank);
      toast.success("Transacción bancaria realizada exitosamente");
      return { success: true, data: data.bank };
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message ||
          "Error al procesar la transacción bancaria"
      );
      return { success: false, error };
    }
  };

  // Transferencias entre Caja y Banco
  const realizarTransferencia = async (transferencia) => {
    try {
      const config = getConfig();
      if (!config) return;

      const { data } = await clienteAxios.post(
        "/cash/transfer",
        transferencia,
        config
      );

      setCaja(data.cash);
      setBanco(data.bank);
      toast.success("Transferencia realizada exitosamente");
      return { success: true, data };
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || "Error al realizar la transferencia"
      );
      return { success: false, error };
    }
  };

  // Pago a Proveedores
  const pagarProveedor = async (pago) => {
    try {
      const config = getConfig();
      if (!config) return;

      const { data } = await clienteAxios.post(
        `/suppliers/${pago.supplierId}/payments`,
        pago,
        config
      );

      if (pago.source === "CAJA") {
        setCaja(data.cash);
      } else {
        setBanco(data.bank);
      }

      toast.success("Pago realizado exitosamente");
      return { success: true, data };
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Error al procesar el pago");
      return { success: false, error };
    }
  };

  // Cobro de Facturas
  const registrarCobro = async (cobro) => {
    try {
      const config = getConfig();
      if (!config) return;

      const { data } = await clienteAxios.post(
        `/invoices/${cobro.invoiceId}/payments`,
        cobro,
        config
      );

      if (cobro.destination === "CAJA") {
        setCaja(data.cash);
      } else {
        setBanco(data.bank);
      }

      toast.success("Cobro registrado exitosamente");
      return { success: true, data };
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || "Error al procesar el cobro"
      );
      return { success: false, error };
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  return (
    <CajaBancoContext.Provider
      value={{
        caja,
        banco,
        loading,
        alerta,
        setAlerta,
        crearTransaccionCaja,
        crearTransaccionBanco,
        realizarTransferencia,
        pagarProveedor,
        registrarCobro,
      }}
    >
      {children}
    </CajaBancoContext.Provider>
  );
};

export const useCajaBanco = () => useContext(CajaBancoContext);
