import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useClientes } from "../context/ClientesContext";
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  CreditCard,
} from "lucide-react";
import TablaFacturas from "../components/clientes/documentos/TablaFacturas";
import TablaPagos from "../components/clientes/documentos/TablaPagos";
import TablaPresupuestos from "../components/clientes/documentos/TablaPresupuestos";
import TablaNotalDebCred from "../components/clientes/documentos/TablaNotalDebCred";

const Cliente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCliente, cliente, loading, CONDICIONES_FISCALES, facturas } =
    useClientes();
  const [activeTab, setActiveTab] = useState("facturas");

  useEffect(() => {
    getCliente(id);
  }, [id]);

  if (loading) return <div className="p-6">Cargando...</div>;
  if (!cliente) return <div className="p-6">Cliente no encontrado</div>;

  const tabs = [
    {
      id: "facturas",
      label: "Facturas",
      count: cliente.documents?.invoices?.length || 0,
    },
    {
      id: "pagos",
      label: "Pagos",
      count: cliente.documents?.payments?.length || 0,
    },
    {
      id: "presupuestos",
      label: "Presupuestos",
      count: cliente.documents?.quotes?.length || 0,
    },
    {
      id: "notas",
      label: "Notas C/D",
      count: cliente.documents?.creditDebitNotes?.length || 0,
    },
    // {
    //   id: "remitos",
    //   label: "Remitos",
    //   count: cliente.documents?.deliveryNotes?.length || 0,
    // },
  ];

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/clientes")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver a Clientes
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 capitalize">
              {cliente.businessName}
            </h1>
            <p className="text-gray-500 mt-1">
              {cliente.documentType}: {cliente.documentNumber}
            </p>
          </div>
          <div className="text-right">
            <span
              className={`inline-flex px-3 py-1 rounded-full text-sm font-medium
              ${
                cliente.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {cliente.isActive ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>
      </div>

      {/* Información del Cliente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-4 border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Información General
          </h3>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <Building2 size={20} className="mr-2" />
              <span>
                {
                  CONDICIONES_FISCALES.find(
                    (c) => c.value === cliente.taxCondition
                  )?.label
                }
              </span>
            </div>
            <div className="flex items-center text-gray-600">
              <Phone size={20} className="mr-2" />
              <span>{cliente.contact?.phone || "No especificado"}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Mail size={20} className="mr-2" />
              <span>{cliente.contact?.email || "No especificado"}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin size={20} className="mr-2" />
              <span>
                {cliente.address?.street} {cliente.address?.number},
                {cliente.address?.city}, {cliente.address?.state}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Información Comercial
          </h3>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <CreditCard size={20} className="mr-2" />
              <span>
                Límite de Crédito: $
                {cliente.paymentInfo?.creditLimit?.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Saldo Actual:</span>
              <span
                className={`font-medium ${
                  cliente.balance?.current > 0
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                ${cliente.balance?.current?.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Última Compra:</span>
              <span className="text-gray-900">
                {cliente.lastPurchaseDate
                  ? new Date(cliente.lastPurchaseDate).toLocaleDateString()
                  : "Sin compras"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              {tab.label}
              <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de las Tabs */}
      <div className="bg-white rounded-lg">
        {activeTab === "facturas" && (
          <TablaFacturas
            facturas={cliente.documents.invoices}
            clienteId={cliente._id}
            cliente={cliente}
          />
        )}
        {activeTab === "pagos" && (
          <TablaPagos
            cliente={cliente}
            pagos={cliente.documents?.payments || []}
            clienteId={cliente._id}
          />
        )}
        {activeTab === "presupuestos" && (
          <TablaPresupuestos
            cliente={cliente}
            presupuestos={cliente.documents?.quotes || []}
            clienteId={cliente._id}
          />
        )}
        {activeTab === "notas" && (
          <TablaNotalDebCred
            notas={cliente.documents?.creditDebitNotes || []}
            clienteId={cliente._id}
          />
        )}
        {/* {activeTab === "remitos" && (
          <TablaRemitos
            remitos={cliente.documents?.deliveryNotes || []}
            clienteId={cliente._id}
          />
        )} */}
      </div>
    </div>
  );
};

export default Cliente;
