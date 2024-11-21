import { useState } from "react";
import { useCompras } from "../../../context/ComprasContext";
import { Plus, FileText, Download } from "lucide-react";
import Modal from "../../Modal/Modal";
import FormularioPagoProveedor from "../formularios/FormularioPagoProveedor";

const TablaPagosProveedor = ({ pagos, proveedor }) => {
  const { METODOS_PAGO } = useCompras();
  const [showModal, setShowModal] = useState(false);
  const [showVerPago, setShowVerPago] = useState(false);
  const [selectedPago, setSelectedPago] = useState(null);

  const handleVerPago = (pago) => {
    setSelectedPago(pago);
    setShowVerPago(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Pagos Realizados</h3>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Nuevo Pago
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Método
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Referencia
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Monto
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pagos.map((pago) => (
              <tr key={pago._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {pago.paymentNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(pago.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {
                    METODOS_PAGO.find((m) => m.value === pago.paymentMethod)
                      ?.label
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {pago.reference || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  ${pago.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleVerPago(pago)}
                    className="text-gray-400 hover:text-gray-900"
                    title="Ver pago"
                  >
                    <FileText size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nuevo Pago"
        width="600px"
      >
        <FormularioPagoProveedor
          providerId={proveedor._id}
          onClose={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
};

export default TablaPagosProveedor;
