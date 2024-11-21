import React, { useState } from "react";
import { X, Printer, Download } from "lucide-react";
import styled from "styled-components";
import { PDFViewer } from "@react-pdf/renderer";
import PaymentPDF from "./PaymentPDF";
import clientAxios from "../../../config/clienteAxios";
import getConfig from "../../../helpers/configHeader";
import toast from "react-hot-toast";

const ModalVerPago = ({ pago, cliente, onClose }) => {
  const [viewMode, setViewMode] = useState("details");
  const [isLoading, setIsLoading] = useState(false);

  const handlePrint = async () => {
    try {
      setIsLoading(true);
      const response = await clientAxios.get(
        `/clients/${cliente.id}/payments/${pago._id}/pdf`,
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
        `/clients/${cliente.id}/payments/${pago._id}/pdf`,
        {
          ...getConfig(),
          responseType: "blob",
        }
      );

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `Recibo-${pago.paymentNumber}.pdf`;
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

  return (
    <ModalContainer>
      <div className="modal-header">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            Recibo #{pago?.paymentNumber || ""}
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
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="modal-content">
        {viewMode === "details" ? (
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Información del Cliente */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Información del Cliente</h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Razón Social:</span>{" "}
                    {cliente?.businessName || "-"}
                  </p>
                  <p>
                    <span className="font-medium">CUIT:</span>{" "}
                    {cliente?.taxId || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Dirección:</span>{" "}
                    {cliente?.address ? (
                      <>
                        {cliente.address.street} {cliente.address.number}
                        {cliente.address.floor
                          ? `, Piso ${cliente.address.floor}`
                          : ""}
                        {cliente.address.apartment
                          ? `, Depto ${cliente.address.apartment}`
                          : ""}
                        {cliente.address.city
                          ? `, ${cliente.address.city}`
                          : ""}
                        {cliente.address.state
                          ? `, ${cliente.address.state}`
                          : ""}
                        {cliente.address.zipCode
                          ? ` (${cliente.address.zipCode})`
                          : ""}
                        {cliente.address.country
                          ? `, ${cliente.address.country}`
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
                    {pago?.date
                      ? new Date(pago.date).toLocaleDateString()
                      : "-"}
                  </p>
                  <p>
                    <span className="font-medium">Método:</span>{" "}
                    {pago?.paymentMethod || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Referencia:</span>{" "}
                    {pago?.reference || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Monto:</span> $
                    {pago?.amount?.toLocaleString() || "0"}
                  </p>
                </div>
              </div>
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
              <PaymentPDF pago={pago} cliente={cliente} />
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

export default ModalVerPago;
