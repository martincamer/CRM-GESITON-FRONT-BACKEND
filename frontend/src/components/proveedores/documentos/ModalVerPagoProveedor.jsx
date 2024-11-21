import React, { useState } from "react";
import { X, Printer, Download } from "lucide-react";
import { PDFViewer } from "@react-pdf/renderer";
import { useCompras } from "../../../context/ComprasContext";
import { useCajaBanco } from "../../../context/CajaBancoContext";
import PaymentProviderPDF from "./PaymentProviderPDF";
import clientAxios from "../../../config/clienteAxios";
import styled from "styled-components";
import getConfig from "../../../helpers/configHeader";
import toast from "react-hot-toast";

const ModalVerPagoProveedor = ({ pago, proveedor, onClose }) => {
  const [viewMode, setViewMode] = useState("details");
  const [isLoading, setIsLoading] = useState(false);
  const { METODOS_PAGO } = useCompras();
  const { cuentas } = useCajaBanco();

  const handlePrint = async () => {
    try {
      setIsLoading(true);
      const response = await clientAxios.get(
        `/providers/${proveedor._id}/payments/${pago._id}/pdf`,
        {
          ...getConfig(),
          responseType: "blob",
        }
      );

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(pdfUrl), 100);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      toast.error("Error al generar el PDF");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const response = await clientAxios.get(
        `/providers/${proveedor._id}/payments/${pago._id}/pdf`,
        {
          ...getConfig(),
          responseType: "blob",
        }
      );

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `Pago-${pago.reference || pago._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(pdfUrl), 100);
      toast.success("PDF descargado exitosamente");
    } catch (error) {
      console.error("Error al descargar PDF:", error);
      toast.error("Error al descargar el PDF");
    } finally {
      setIsLoading(false);
    }
  };

  const getCuentaInfo = (accountId) => {
    const cuenta = cuentas.find((c) => c._id === accountId);
    return cuenta ? `${cuenta.name} - ${cuenta.bank}` : "N/A";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatAmount = (amount) => {
    return amount.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
    });
  };

  const getMetodoPagoLabel = (metodoPago) => {
    const metodo = METODOS_PAGO.find((m) => m.value === metodoPago);
    return metodo ? metodo.label : metodoPago;
  };

  return (
    <ModalContainer>
      <div className="modal-header">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            Comprobante de Pago {pago?.reference ? `#${pago.reference}` : ""}
          </h2>
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded ${
                viewMode === "details"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
              onClick={() => setViewMode("details")}
            >
              Detalles
            </button>
            <button
              className={`px-3 py-1 rounded ${
                viewMode === "pdf" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
              onClick={() => setViewMode("pdf")}
            >
              PDF
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className={`text-gray-600 hover:text-gray-900 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
            title="Imprimir"
          >
            <Printer size={20} />
          </button>
          <button
            onClick={handleDownload}
            className={`text-gray-600 hover:text-gray-900 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
            title="Descargar"
          >
            <Download size={20} />
          </button>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
            title="Cerrar"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="modal-content">
        {viewMode === "details" ? (
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Información del Proveedor */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">
                  Información del Proveedor
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Razón Social:</span>{" "}
                    {proveedor?.businessName || "-"}
                  </p>
                  <p>
                    <span className="font-medium">CUIT:</span>{" "}
                    {proveedor?.taxId || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Dirección:</span>{" "}
                    {proveedor?.address ? (
                      <>
                        {proveedor.address.street} {proveedor.address.number}
                        {proveedor.address.floor
                          ? `, Piso ${proveedor.address.floor}`
                          : ""}
                        {proveedor.address.apartment
                          ? `, Depto ${proveedor.address.apartment}`
                          : ""}
                        {proveedor.address.city
                          ? `, ${proveedor.address.city}`
                          : ""}
                        {proveedor.address.state
                          ? `, ${proveedor.address.state}`
                          : ""}
                        {proveedor.address.zipCode
                          ? ` (${proveedor.address.zipCode})`
                          : ""}
                      </>
                    ) : (
                      "-"
                    )}
                  </p>
                </div>
              </div>

              {/* Información del Pago */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Detalles del Pago</h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Fecha:</span>{" "}
                    {formatDate(pago?.date)}
                  </p>
                  <p>
                    <span className="font-medium">Método:</span>{" "}
                    {getMetodoPagoLabel(pago?.paymentMethod)}
                  </p>
                  {pago?.accountId && cuentas?.length > 0 && (
                    <p>
                      <span className="font-medium">Cuenta:</span>{" "}
                      {getCuentaInfo(pago.accountId)}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Monto:</span>{" "}
                    {formatAmount(pago?.amount)}
                  </p>
                  <p>
                    <span className="font-medium">Referencia:</span>{" "}
                    {pago?.reference || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Facturas Asociadas */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Facturas Asociadas</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Número
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Monto Pagado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pago?.invoices?.map((factura) => (
                    <tr key={factura._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {factura.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(factura.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatAmount(factura.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatAmount(factura.amountPaid)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Observaciones */}
            {pago?.observation && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Observaciones</h3>
                <p className="text-gray-600">{pago.observation}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="pdf-viewer">
            <PDFViewer width="100%" height="600px">
              <PaymentProviderPDF pago={pago} proveedor={proveedor} />
            </PDFViewer>
          </div>
        )}
      </div>
    </ModalContainer>
  );
};

const ModalContainer = styled.div`
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-content {
    max-height: calc(100vh - 200px);
    overflow-y: auto;
  }

  .pdf-viewer {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
  }
`;

export default ModalVerPagoProveedor;
