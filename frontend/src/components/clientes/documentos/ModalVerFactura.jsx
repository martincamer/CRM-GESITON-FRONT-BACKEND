import React, { useState, useEffect } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import { X, Printer, Download } from "lucide-react";
import getConfig from "../../../helpers/configHeader";
import styled from "styled-components";
import clientAxios from "../../../config/clienteAxios";
import toast from "react-hot-toast";
import InvoicePDF from "./InvoicePDF";

const ModalVerFactura = ({ factura, cliente, onClose, productos }) => {
  const [viewMode, setViewMode] = useState("details");
  const [isLoading, setIsLoading] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfUrl, setPdfUrl] = useState(null);

  // Función para formatear números
  const formatNumber = (number) => {
    if (!number) return "0";
    return new Intl.NumberFormat("es-AR").format(number);
  };

  const loadPDF = async () => {
    try {
      setIsLoading(true);
      const response = await clientAxios.get(
        `/clients/${cliente.id}/invoices/${factura._id}/pdf`,
        {
          ...getConfig(),
          responseType: "blob",
        }
      );

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
    } catch (error) {
      console.error("Error al cargar PDF:", error);
      toast.error("Error al cargar el PDF");
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar PDF cuando se cambia a la vista PDF
  useEffect(() => {
    if (viewMode === "pdf" && !pdfUrl) {
      loadPDF();
    }
  }, [viewMode]);

  // Limpiar URL del blob al desmontar
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const changePage = (offset) => {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const handlePrint = async () => {
    try {
      setIsLoading(true);
      const response = await clientAxios.get(
        `/clients/${cliente.id}/invoices/${factura._id}/pdf`,
        {
          ...getConfig(),
          responseType: "blob",
        }
      );

      // Crear URL del blob
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = window.URL.createObjectURL(pdfBlob);

      // Abrir en nueva ventana
      window.open(pdfUrl, "_blank");

      // Limpiar URL
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
        `/clients/${cliente.id}/invoices/${factura._id}/pdf`,
        {
          ...getConfig(),
          responseType: "blob",
        }
      );

      // Crear URL del blob
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = window.URL.createObjectURL(pdfBlob);

      // Crear link y descargar
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `Factura-${factura.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Limpiar
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
            Factura #{factura?.invoiceNumber || ""}
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
                    {factura?.client?.businessName || "-"}
                  </p>
                  <p>
                    <span className="font-medium">CUIT:</span>{" "}
                    {factura?.client?.taxId || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Dirección:</span>{" "}
                    {factura?.client?.address || "-"}
                  </p>
                </div>
              </div>

              {/* Información de la Factura */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Detalles de la Factura</h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Fecha:</span>{" "}
                    {factura?.date
                      ? new Date(factura.date).toLocaleDateString()
                      : "-"}
                  </p>
                  <p>
                    <span className="font-medium">Vencimiento:</span>{" "}
                    {factura?.dueDate
                      ? new Date(factura.dueDate).toLocaleDateString()
                      : "-"}
                  </p>
                  <p>
                    <span className="font-medium">Estado:</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold
                      ${
                        factura?.paymentStatus === "PAGADO"
                          ? "bg-green-100 text-green-800"
                          : factura?.paymentStatus === "PARCIAL"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {factura?.paymentStatus || "PENDIENTE"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Tabla de Items */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Items</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Precio Unit.
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Desc.
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {factura?.items?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                        {productos.find((p) => p._id === item.product)?.name ||
                          ""}
                        {/* {item?.description ? ` - ${item.description}` : ""} */}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-900">
                        {formatNumber(item?.quantity)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-900">
                        ${formatNumber(item?.unitPrice)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-900">
                        {item?.discount || 0}%
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-900">
                        ${formatNumber(item?.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td
                      colSpan="4"
                      className="px-6 py-4 text-right font-semibold"
                    >
                      Total:
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      ${formatNumber(factura?.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Observaciones */}
            {factura?.observation && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Observaciones</h3>
                <p className="text-gray-600">{factura.observation}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="pdf-viewer">
            <PDFViewer width="100%" height="600px">
              <InvoicePDF
                factura={factura}
                cliente={cliente}
                productos={productos}
              />
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

    .react-pdf__Document {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .react-pdf__Page {
      margin: 1rem 0;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
  }

  .pdf-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
    padding: 0.5rem;
    background: #f9fafb;
    border-radius: 0.5rem;
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    color: #6b7280;
  }
`;

export default ModalVerFactura;
