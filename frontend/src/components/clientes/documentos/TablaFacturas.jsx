import { useEffect, useState } from "react";
import { useClientes } from "../../../context/ClientesContext";
import { Plus, FileText, Download } from "lucide-react";
import Modal from "../../Modal/Modal";
import FormularioFactura from "../formularios/FormularioFactura";
import ModalVerFactura from "./ModalVerFactura";
import { useProductos } from "../../../context/ProductosContext";

const TablaFacturas = ({ facturas, clienteId, cliente }) => {
  const { TIPOS_FACTURA } = useClientes();
  const { productos, getProductos } = useProductos();
  const [showModal, setShowModal] = useState(false);
  const [showFacturaModal, setShowFacturaModal] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState(null);

  const handleVerFactura = (factura) => {
    setSelectedFactura(factura);
    setShowFacturaModal(true);
  };

  useEffect(() => {
    getProductos();
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Facturas Emitidas</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Nueva Factura
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vencimiento
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {facturas?.map((factura) => (
              <tr key={factura._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {factura.invoiceNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {
                    TIPOS_FACTURA.find((t) => t.value === factura.invoiceType)
                      ?.label
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(factura.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {factura.dueDate &&
                    new Date(factura.dueDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  ${factura.total.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${
                      factura.paymentStatus === "PAGADO"
                        ? "bg-green-100 text-green-800"
                        : factura.paymentStatus === "PARCIAL"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {factura.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    className="text-gray-400 hover:text-gray-900"
                    title="Ver Factura"
                    onClick={() => handleVerFactura(factura)}
                  >
                    <FileText size={20} />
                  </button>
                  {/* <button
                    className="text-gray-400 hover:text-gray-900 ml-3"
                    title="Descargar"
                  >
                    <Download size={20} />
                  </button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Nueva Factura */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nueva Factura"
        width="1200px"
      >
        <FormularioFactura
          clienteId={clienteId}
          onClose={() => setShowModal(false)}
        />
      </Modal>

      {showFacturaModal && selectedFactura && (
        <Modal
          isOpen={showFacturaModal}
          onClose={() => setShowFacturaModal(false)}
          title=""
          width="1200px"
        >
          <ModalVerFactura
            productos={productos}
            factura={selectedFactura}
            cliente={cliente}
            onClose={() => setShowFacturaModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default TablaFacturas;
