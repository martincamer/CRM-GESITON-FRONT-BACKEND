import React, { useState, useEffect } from "react";
import { X, Printer, Download, FileCheck } from "lucide-react";
import styled from "styled-components";
import { PDFViewer } from "@react-pdf/renderer";
import QuotePDF from "./QuotePDF";
import clientAxios from "../../../config/clienteAxios";
import getConfig from "../../../helpers/configHeader";
import toast from "react-hot-toast";
import { useProductos } from "../../../context/ProductosContext";

const ModalVerPresupuesto = ({
  presupuesto,
  cliente,
  onClose,
  onConvertToInvoice,
}) => {
  const { productos, getProductos } = useProductos();
  const [productNames, setProductNames] = useState({});
  const [viewMode, setViewMode] = useState("details");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getProductos();
  }, []);

  useEffect(() => {
    const productMap = {};
    presupuesto.items.forEach((item) => {
      const product = productos.find(
        (p) => p._id?.toString() === item.productId?.toString()
      );
      if (product) {
        productMap[item.product] = product.name;
      }
    });
    setProductNames(productMap);
  }, [presupuesto.items, productos]);

  const handlePrint = async () => {
    try {
      setIsLoading(true);
      const response = await clientAxios.get(
        `/clients/${cliente.id}/quotes/${presupuesto._id}/pdf`,
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
        `/clients/${cliente.id}/quotes/${presupuesto._id}/pdf`,
        {
          ...getConfig(),
          responseType: "blob",
        }
      );

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `Presupuesto-${presupuesto.quoteNumber}.pdf`;
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

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDIENTE":
        return "bg-yellow-100 text-yellow-800";
      case "APROBADO":
        return "bg-green-100 text-green-800";
      case "RECHAZADO":
        return "bg-red-100 text-red-800";
      case "FACTURADO":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <ModalContainer>
      <div className="modal-header">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            Presupuesto #{presupuesto?.quoteNumber || ""}
          </h2>
          <span
            className={`px-2 text-xs font-semibold rounded-full ${getStatusColor(
              presupuesto?.status
            )}`}
          >
            {presupuesto?.status}
          </span>
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
          {presupuesto?.status === "APROBADO" && (
            <button
              onClick={onConvertToInvoice}
              className="text-gray-600 hover:text-green-600"
              title="Convertir a Factura"
            >
              <FileCheck size={20} />
            </button>
          )}
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

              {/* Información del Presupuesto */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Detalles del Presupuesto</h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Fecha:</span>{" "}
                    {new Date(presupuesto?.date).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Válido Hasta:</span>{" "}
                    {new Date(presupuesto?.validUntil).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Total:</span> $
                    {presupuesto?.total.toLocaleString()}
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
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Precio Unit.
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Descuento
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {presupuesto?.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                        {productNames[item.product] || "Producto no encontrado"}
                        {/* {item?.description && (
                          <span className="text-gray-500 ml-2">
                            - {item.description}
                          </span>
                        )} */}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        ${item.unitPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {item.discount}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        ${item.subtotal.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Observaciones */}
            {presupuesto?.observation && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Observaciones</h3>
                <p className="text-gray-600">{presupuesto.observation}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="pdf-viewer">
            <PDFViewer width="100%" height="600px">
              <QuotePDF
                presupuesto={presupuesto}
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
  }
`;

export default ModalVerPresupuesto;
