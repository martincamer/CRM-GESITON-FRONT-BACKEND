import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCompras } from "../context/ComprasContext";
import {
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  CreditCard,
  FileText,
  ShoppingBag,
  FileDown,
  Truck,
  Plus,
  ArrowLeft,
} from "lucide-react";
import Modal from "../components/Modal/Modal";
import useModal from "../hooks/useModal";
import FormularioFactura from "../components/proveedores/FormularioFactura";
import FormularioOrdenCompra from "../components/proveedores/FormularioOrdenCompra";
import TablaFacturas from "../components/proveedores/TablaFacturas";
import TablaOrdenesCompra from "../components/proveedores/TablaOrdenesCompra";
import TablaPagosProveedor from "../components/proveedores/documentos/TablaPagosProveedor";

const DetalleProveedor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProveedor, proveedor, loading, CONDICIONES_FISCALES } =
    useCompras();
  const [activeTab, setActiveTab] = useState("info");

  const { modalStates, openModal, closeModal } = useModal([
    "addInvoice",
    "addPurchaseOrder",
  ]);

  useEffect(() => {
    getProveedor(id);
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!proveedor) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-semibold text-gray-800">
          Proveedor no encontrado
        </h2>
      </div>
    );
  }

  const tabs = [
    { id: "info", label: "Información General" },
    { id: "invoices", label: "Facturas" },
    { id: "orders", label: "Órdenes de Compra" },
    { id: "delivery", label: "Remitos" },
    { id: "history", label: "Historial" },
    { id: "payments", label: "Pagos" },
  ];

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver a Proveedores
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Razon social - {proveedor.businessName}
            </h1>
            <p className="text-gray-500 mt-1 capitalize">
              {proveedor.fantasyName}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => openModal("addInvoice")}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <Plus size={20} />
              Nueva Factura
            </button>
            <button
              onClick={() => openModal("addPurchaseOrder")}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              <Plus size={20} />
              Nueva Orden
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de los tabs */}
      <div className="mt-6">
        {activeTab === "info" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Básica */}
            <div className="bg-white p-6 border">
              <h3 className="text-lg font-semibold mb-4">Información Básica</h3>
              <div className="space-y-4">
                <InfoItem
                  icon={<Building2 size={20} />}
                  label="CUIT"
                  value={proveedor.cuit}
                />
                <InfoItem
                  icon={<CreditCard size={20} />}
                  label="Condición Fiscal"
                  value={
                    CONDICIONES_FISCALES.find(
                      (c) => c.value === proveedor.taxCondition
                    )?.label
                  }
                />
                <InfoItem
                  icon={<Phone size={20} />}
                  label="Teléfono"
                  value={proveedor.contact?.phone}
                />
                <InfoItem
                  icon={<Mail size={20} />}
                  label="Email"
                  value={proveedor.contact?.email}
                />
                <InfoItem
                  icon={<Globe size={20} />}
                  label="Sitio Web"
                  value={proveedor.contact?.website}
                />
              </div>
            </div>

            {/* Dirección */}
            <div className="bg-white p-6 border">
              <h3 className="text-lg font-semibold mb-4">Dirección</h3>
              <div className="space-y-4">
                <InfoItem
                  icon={<MapPin size={20} />}
                  label="Dirección"
                  value={`${proveedor.address?.street} ${proveedor.address?.number}`}
                />
                {proveedor.address?.floor && (
                  <InfoItem
                    icon={<Building2 size={20} />}
                    label="Piso/Depto"
                    value={`${proveedor.address.floor} ${proveedor.address.apartment}`}
                  />
                )}
                <InfoItem
                  icon={<MapPin size={20} />}
                  label="Ciudad"
                  value={`${proveedor.address?.city}, ${proveedor.address?.state}`}
                />
                <InfoItem
                  icon={<MapPin size={20} />}
                  label="Código Postal"
                  value={proveedor.address?.zipCode}
                />
              </div>
            </div>

            {/* Condiciones Comerciales */}
            <div className="bg-white p-6 border">
              <h3 className="text-lg font-semibold mb-4">
                Condiciones Comerciales
              </h3>
              <div className="space-y-4">
                <InfoItem
                  icon={<CreditCard size={20} />}
                  label="Límite de Crédito"
                  value={`$${proveedor.paymentConditions?.creditLimit?.toFixed(
                    2
                  )}`}
                />
                <InfoItem
                  icon={<FileText size={20} />}
                  label="Días de Vencimiento"
                  value={`${proveedor.paymentConditions?.defaultDueDays} días`}
                />
                <InfoItem
                  icon={<CreditCard size={20} />}
                  label="Saldo Actual"
                  value={`$${proveedor.balance?.current?.toFixed(2)}`}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "invoices" && (
          <TablaFacturas
            facturas={proveedor.documents?.invoices || []}
            onAddInvoice={() => openModal("addInvoice")}
          />
        )}

        {activeTab === "orders" && (
          <TablaOrdenesCompra
            ordenes={proveedor.documents?.purchaseOrders || []}
            onAddOrder={() => openModal("addPurchaseOrder")}
          />
        )}

        {activeTab === "payments" && (
          <TablaPagosProveedor
            pagos={proveedor.documents?.payments || []}
            proveedor={proveedor}
          />
        )}

        {activeTab === "delivery" && (
          <div className="text-center py-8 text-gray-500">
            Sección de remitos en desarrollo
          </div>
        )}

        {activeTab === "history" && (
          <div className="text-center py-8 text-gray-500">
            Historial en desarrollo
          </div>
        )}
      </div>

      {/* Modales */}
      <Modal
        isOpen={modalStates.addInvoice}
        onClose={() => closeModal("addInvoice")}
        title="Nueva Factura"
        width="800px"
      >
        <FormularioFactura
          proveedor={proveedor}
          onClose={() => closeModal("addInvoice")}
        />
      </Modal>

      <Modal
        isOpen={modalStates.addPurchaseOrder}
        onClose={() => closeModal("addPurchaseOrder")}
        title="Nueva Orden de Compra"
        width="800px"
      >
        <FormularioOrdenCompra
          proveedor={proveedor}
          onClose={() => closeModal("addPurchaseOrder")}
        />
      </Modal>
    </div>
  );
};

// Componente auxiliar para mostrar información
const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 text-gray-400 w-8">{icon}</div>
    <div className="ml-2">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-sm text-gray-900">{value || "-"}</p>
    </div>
  </div>
);

export default DetalleProveedor;
