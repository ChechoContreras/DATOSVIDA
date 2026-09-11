import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function GraficoIndicadores({ datos }) {
  if (datos.length === 0) return null;

  const etiquetas = datos.map(
    (d) => `${d.municipio.nombre}\n${d.indicador.nombre}`
  );
  const valores = datos.map((d) => d.valor);

  const data = {
    labels: etiquetas,
    datasets: [
      {
        label: "Valor del indicador (%)",
        data: valores,
        backgroundColor: "#b5793a",
        borderRadius: 3,
        maxBarThickness: 46,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: { color: "#22291f", font: { size: 11 } },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#22291f" },
        grid: { color: "#e6e1d3" },
      },
    },
  };

  return (
    <div className="grafico-contenedor">
      <Bar data={data} options={options} />
    </div>
  );
}
