import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCajaBanco } from "../context/CajaBancoContext";
import { useClientes } from "../context/ClientesContext";
import { useCompras } from "../context/ComprasContext";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import styled from "styled-components";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  CreditCard,
  Activity,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import { Calendar, ChevronDown } from "lucide-react";

registerLocale("es", es);

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { auth } = useAuth();
  const { caja, banco, getCaja, getBanco } = useCajaBanco();
  const { clientes, getClientes } = useClientes();
  const { getProveedores, proveedores } = useCompras();

  // Estado inicial para manejar la carga
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  });
  const [filterType, setFilterType] = useState("month"); // 'custom', 'month', 'year'

  console.log({ proveedores });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          getClientes(),
          getProveedores(),
          getCaja(),
          getBanco(),
        ]);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const handleFilterChange = (type) => {
    setFilterType(type);
    switch (type) {
      case "month":
        setDateRange({
          startDate: startOfMonth(new Date()),
          endDate: endOfMonth(new Date()),
        });
        break;
      case "year":
        setDateRange({
          startDate: startOfYear(new Date()),
          endDate: endOfYear(new Date()),
        });
        break;
      // 'custom' no necesita cambios, se maneja con el DatePicker
    }
  };

  const calcularEstadisticas = () => {
    if (isLoading || !clientes || !proveedores || !caja || !banco) {
      return {
        ventas: {
          total: 0,
          mensual: new Array(12).fill(0),
          comparacion: 0,
        },
        compras: {
          total: 0,
          mensual: new Array(12).fill(0),
          comparacion: 0,
        },
        saldos: {
          caja: 0,
          banco: 0,
          cajaMensual: new Array(12).fill(0),
          bancoMensual: new Array(12).fill(0),
        },
        ganancias: {
          total: 0,
          mensual: new Array(12).fill(0),
          comparacion: 0,
        },
      };
    }

    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    // Calcular compras del mes actual
    const comprasMes = proveedores.reduce((total, proveedor) => {
      const facturasFiltradas =
        proveedor.documents?.invoices?.filter(
          (factura) =>
            new Date(factura.date) >= dateRange.startDate &&
            new Date(factura.date) <= dateRange.endDate &&
            factura.paymentStatus !== "ANULADA"
        ) || [];

      return (
        total +
        facturasFiltradas.reduce((sum, factura) => sum + factura.total, 0)
      );
    }, 0);

    // Calcular ventas del mes (ingresos de caja y banco)
    const ingresosCajaMes = (caja?.transactions || [])
      .filter(
        (mov) =>
          new Date(mov.date) >= primerDiaMes &&
          mov.type === "INGRESO" &&
          mov.category === "VENTA"
      )
      .reduce((sum, mov) => sum + mov.amount, 0);

    const ingresosBancoMes = (banco?.transactions || [])
      .filter(
        (mov) =>
          new Date(mov.date) >= primerDiaMes &&
          mov.type === "INGRESO" &&
          mov.category === "COBRO_CLIENTE"
      )
      .reduce((sum, mov) => sum + mov.amount, 0);

    const ventasTotalMes = ingresosCajaMes + ingresosBancoMes;

    // Calcular históricos mensuales
    const ventasPorMes = new Array(12).fill(0);
    const comprasPorMes = new Array(12).fill(0);

    // Llenar datos de compras por mes
    proveedores.forEach((proveedor) => {
      proveedor.documents?.invoices?.forEach((factura) => {
        if (factura.paymentStatus !== "ANULADA") {
          const mes = new Date(factura.date).getMonth();
          comprasPorMes[mes] += factura.total;
        }
      });
    });

    // Llenar datos de ventas por mes (desde transacciones)
    caja?.transactions?.forEach((mov) => {
      if (mov.type === "INGRESO" && mov.category === "VENTA") {
        const mes = new Date(mov.date).getMonth();
        ventasPorMes[mes] += mov.amount;
      }
    });

    banco?.transactions?.forEach((mov) => {
      if (mov.type === "INGRESO" && mov.category === "COBRO_CLIENTE") {
        const mes = new Date(mov.date).getMonth();
        ventasPorMes[mes] += mov.amount;
      }
    });

    return {
      ventas: {
        total: ventasTotalMes,
        mensual: ventasPorMes,
        comparacion: calcularComparacion(ventasPorMes),
      },
      compras: {
        total: comprasMes,
        mensual: comprasPorMes,
        comparacion: calcularComparacion(comprasPorMes),
      },
      saldos: {
        caja: caja?.balance || 0,
        banco: banco?.balance || 0,
        cajaMensual:
          caja?.transactions?.map((mov) =>
            mov.type === "INGRESO" ? mov.amount : -mov.amount
          ) || [],
        bancoMensual:
          banco?.transactions?.map((mov) =>
            mov.type === "INGRESO" ? mov.amount : -mov.amount
          ) || [],
      },
      ganancias: {
        total: ventasTotalMes - comprasMes,
        mensual: ventasPorMes.map((venta, i) => venta - comprasPorMes[i]),
        comparacion: ((ventasTotalMes - comprasMes) / (comprasMes || 1)) * 100,
      },
    };
  };

  const calcularComparacion = (datosMensuales) => {
    const mesActual = new Date().getMonth();
    const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
    const valorMesActual = datosMensuales[mesActual];
    const valorMesAnterior = datosMensuales[mesAnterior];

    return valorMesAnterior === 0
      ? 100
      : ((valorMesActual - valorMesAnterior) / valorMesAnterior) * 100;
  };

  // Mostrar loading mientras se cargan los datos
  if (isLoading) {
    return (
      <DashboardContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardContainer>
    );
  }

  const estadisticas = calcularEstadisticas();

  const ventasChartData = {
    labels: [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ],
    datasets: [
      {
        label: "Ventas",
        data: estadisticas.ventas.mensual,
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f680",
      },
      {
        label: "Compras",
        data: estadisticas.compras.mensual,
        borderColor: "#ef4444",
        backgroundColor: "#ef444480",
      },
    ],
  };

  return (
    <DashboardContainer>
      <WelcomeSection>
        <h1>Bienvenido, {auth.user.nombre}!</h1>
        <FilterContainer>
          <FilterButtons>
            <FilterButton
              active={filterType === "month"}
              onClick={() => handleFilterChange("month")}
            >
              Mes Actual
            </FilterButton>
            <FilterButton
              active={filterType === "year"}
              onClick={() => handleFilterChange("year")}
            >
              Año Actual
            </FilterButton>
            <FilterButton
              active={filterType === "custom"}
              onClick={() => handleFilterChange("custom")}
            >
              Personalizado
            </FilterButton>
          </FilterButtons>

          {filterType === "custom" && (
            <DatePickerContainer>
              <DatePicker
                selectsRange
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onChange={(update) => {
                  setDateRange({
                    startDate: update[0],
                    endDate: update[1] || update[0],
                  });
                }}
                locale="es"
                dateFormat="dd/MM/yyyy"
                customInput={
                  <CustomDateInput>
                    <Calendar size={16} />
                    <span>
                      {format(dateRange.startDate, "dd/MM/yyyy")} -
                      {dateRange.endDate
                        ? format(dateRange.endDate, "dd/MM/yyyy")
                        : ""}
                    </span>
                    <ChevronDown size={16} />
                  </CustomDateInput>
                }
              />
            </DatePickerContainer>
          )}
        </FilterContainer>
      </WelcomeSection>

      <StatsGrid>
        <StatCard>
          <StatIcon className="bg-blue-100 text-blue-600">
            <DollarSign size={24} />
          </StatIcon>
          <StatInfo>
            <StatLabel>Ventas Totales</StatLabel>
            <StatValue>${estadisticas.ventas.total.toLocaleString()}</StatValue>
            <StatChange positive={estadisticas.ventas.comparacion > 0}>
              {estadisticas.ventas.comparacion > 0 ? (
                <ArrowUp size={16} />
              ) : (
                <ArrowDown size={16} />
              )}
              {Math.abs(estadisticas.ventas.comparacion).toFixed(1)}%
            </StatChange>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon className="bg-red-100 text-red-600">
            <ShoppingCart size={24} />
          </StatIcon>
          <StatInfo>
            <StatLabel>Compras Totales</StatLabel>
            <StatValue>
              ${estadisticas.compras.total.toLocaleString()}
            </StatValue>
            <StatChange positive={estadisticas.compras.comparacion < 0}>
              {estadisticas.compras.comparacion > 0 ? (
                <ArrowUp size={16} />
              ) : (
                <ArrowDown size={16} />
              )}
              {Math.abs(estadisticas.compras.comparacion).toFixed(1)}%
            </StatChange>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon className="bg-green-100 text-green-600">
            <TrendingUp size={24} />
          </StatIcon>
          <StatInfo>
            <StatLabel>Ganancias</StatLabel>
            <StatValue>
              ${estadisticas.ganancias.total.toLocaleString()}
            </StatValue>
            <StatChange positive={estadisticas.ganancias.comparacion > 0}>
              {estadisticas.ganancias.comparacion > 0 ? (
                <ArrowUp size={16} />
              ) : (
                <ArrowDown size={16} />
              )}
              {Math.abs(estadisticas.ganancias.comparacion).toFixed(1)}%
            </StatChange>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon className="bg-purple-100 text-purple-600">
            <CreditCard size={24} />
          </StatIcon>
          <StatInfo>
            <StatLabel>Saldo en Banco</StatLabel>
            <StatValue>${estadisticas.saldos.banco.toLocaleString()}</StatValue>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      <ChartsGrid>
        <ChartCard>
          <ChartTitle>Ventas vs Compras</ChartTitle>
          <Line
            data={ventasChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                },
              },
            }}
          />
        </ChartCard>

        <ChartCard>
          <ChartTitle>Distribución de Ingresos</ChartTitle>
          <Doughnut
            data={{
              labels: ["Ventas", "Otros Ingresos"],
              datasets: [
                {
                  data: [
                    estadisticas.ventas.total,
                    estadisticas.ventas.total * 0.1,
                  ],
                  backgroundColor: ["#3b82f6", "#10b981"],
                },
              ],
            }}
          />
        </ChartCard>
      </ChartsGrid>
    </DashboardContainer>
  );
};

// Estilos
const DashboardContainer = styled.div`
  padding: 2rem;
  background-color: #f9fafb;
  min-height: 100vh;
`;

const WelcomeSection = styled.div`
  margin-bottom: 2rem;
  h1 {
    font-size: 1.875rem;
    font-weight: 600;
    color: #111827;
  }
  p {
    color: #6b7280;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div`
  padding: 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
`;

const StatChange = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: ${(props) => (props.positive ? "#059669" : "#dc2626")};
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
`;

const ChartCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ChartTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
`;

const FilterContainer = styled.div`
  margin: 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  background-color: ${(props) => (props.active ? "#3b82f6" : "#fff")};
  color: ${(props) => (props.active ? "#fff" : "#374151")};
  border: 1px solid ${(props) => (props.active ? "#3b82f6" : "#e5e7eb")};

  &:hover {
    background-color: ${(props) => (props.active ? "#2563eb" : "#f9fafb")};
  }
`;

const DatePickerContainer = styled.div`
  .react-datepicker-wrapper {
    width: auto;
  }

  .react-datepicker {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    font-family: inherit;
  }

  .react-datepicker__header {
    background-color: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
  }

  .react-datepicker__day--selected {
    background-color: #3b82f6;
  }
`;

const CustomDateInput = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: #fff;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f9fafb;
  }

  svg {
    color: #6b7280;
  }
`;

export default Dashboard;
