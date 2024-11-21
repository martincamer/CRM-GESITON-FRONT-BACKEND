import { useState } from "react";
import { useClientes } from "../../../context/ClientesContext";
import { Plus, FileText, Download } from "lucide-react";
import Modal from "../../Modal/Modal";
import FormularioNotaDebCred from "../formularios/FormularioNotaDebCred";

const TablaNotalDebCred = ({ notas = [], clienteId }) => {
  const { TIPOS_NOTA } = useClientes();
  const [showModal, setShowModal] = useState(false);
  const [showNotaModal, setShowNotaModal] = useState(false);
  const [selectedNota, setSelectedNota] = useState(null);

  const handleVerNota = (nota) => {
    setSelectedNota(nota);
    setShowNotaModal(true);
  };

  const getEstadoLabel = (status) => {
    const estados = {
      PENDIENTE: "Pendiente",
      APLICADO: "Aplicada",
      ANULADO: "Anulada",
    };
    return estados[status] || status;
  };

  const getEstadoClase = (status) => {
    const clases = {
      PENDIENTE: "bg-yellow-100 text-yellow-800",
      APLICADO: "bg-green-100 text-green-800",
      ANULADO: "bg-red-100 text-red-800",
    };
    return clases[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Notas de Débito/Crédito
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Nueva Nota
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
                Factura Asociada
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
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
            {notas?.map((nota) => (
              <tr key={nota._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {nota.noteNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {TIPOS_NOTA.find((t) => t.value === nota.noteType)?.label}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {nota.relatedInvoice}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(nota.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  ${(nota.total || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoClase(
                      nota.status
                    )}`}
                  >
                    {getEstadoLabel(nota.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    className="text-gray-400 hover:text-gray-900"
                    title="Ver Nota"
                    onClick={() => handleVerNota(nota)}
                  >
                    <FileText size={20} />
                  </button>
                  <button
                    className="text-gray-400 hover:text-gray-900 ml-3"
                    title="Descargar"
                  >
                    <Download size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Nueva Nota */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nueva Nota de Débito/Crédito"
        width="1200px"
      >
        <FormularioNotaDebCred
          clienteId={clienteId}
          onClose={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
};

export default TablaNotalDebCred;
