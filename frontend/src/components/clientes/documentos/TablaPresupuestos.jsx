import { useState } from "react";
import { Plus, FileText, Download, FileCheck } from "lucide-react";
import Modal from "../../Modal/Modal";
import FormularioPresupuesto from "../formularios/FormularioPresupuesto";
import ModalVerPresupuesto from "./ModalVerPresupuesto";

const TablaPresupuestos = ({ presupuestos, clienteId, cliente }) => {
  const [showModal, setShowModal] = useState(false);
  const [showVerPresupuesto, setShowVerPresupuesto] = useState(false);
  const [selectedPresupuesto, setSelectedPresupuesto] = useState(null);

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

  const handleVerPresupuesto = (presupuesto) => {
    setSelectedPresupuesto(presupuesto);
    setShowVerPresupuesto(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Presupuestos</h3>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Nuevo Presupuesto
        </button>
      </div>

      <div className="overflow-x-auto">
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Válido Hasta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {presupuestos.map((presupuesto) => (
              <tr key={presupuesto._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {presupuesto.quoteNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(presupuesto.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  ${presupuesto.total.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(presupuesto.validUntil).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      presupuesto.status
                    )}`}
                  >
                    {presupuesto.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleVerPresupuesto(presupuesto)}
                    className="text-gray-400 hover:text-gray-900"
                    title="Ver presupuesto"
                  >
                    <FileText size={20} />
                  </button>
                  {/* <button
                    className="text-gray-400 hover:text-gray-900 ml-3"
                    title="Descargar"
                  >
                    <Download size={20} />
                  </button> */}
                  {presupuesto.status === "APROBADO" && (
                    <button
                      className="text-gray-400 hover:text-green-600 ml-3"
                      title="Convertir a Factura"
                    >
                      <FileCheck size={20} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nuevo Presupuesto"
        width="1500px"
      >
        <FormularioPresupuesto
          clienteId={clienteId}
          onClose={() => setShowModal(false)}
        />
      </Modal>

      {/* Modal Ver Presupuesto */}
      {showVerPresupuesto && (
        <Modal
          isOpen={showVerPresupuesto}
          onClose={() => setShowVerPresupuesto(false)}
          width="800px"
        >
          <ModalVerPresupuesto
            presupuesto={selectedPresupuesto}
            cliente={cliente}
            onClose={() => setShowVerPresupuesto(false)}
            onConvertToInvoice={() => {
              // Implementar la lógica para convertir a factura
              console.log("Convertir a factura:", selectedPresupuesto);
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default TablaPresupuestos;
