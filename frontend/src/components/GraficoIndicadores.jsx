import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function GraficoIndicadores({ datos }) {
  // Si no hay datos, no mostramos el gráfico
  if (!datos || datos.length === 0) return null;

  /*
   * Generamos las etiquetas del gráfico.
   *
   * Los resultados pueden venir asociados a:
   * - un municipio
   * - un territorio (por ejemplo PDET Colombia)
   *
   * El operador ?. evita que la aplicación falle
   * si alguno de estos objetos no existe.
   */
  const etiquetas = datos.map((d) => {
    const territorio =
      d.municipio?.nombre ||
      d.territorio?.nombre ||
      "Territorio";

    const indicador =
      d.indicador?.nombre ||
      "Indicador";

    return `${territorio}\n${indicador}`;
  });

  // Valores numéricos de los indicadores
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
      legend: {
        display: false,
      },

      tooltip: {
        callbacks: {
          title: (items) => {
            const indice = items[0]?.dataIndex;
            const dato = datos[indice];

            if (!dato) return "";

            const territorio =
              dato.municipio?.nombre ||
              dato.territorio?.nombre ||
              "Territorio";

            const indicador =
              dato.indicador?.nombre ||
              "Indicador";

            return `${territorio} - ${indicador}`;
          },
        },
      },
    },

    scales: {
      x: {
        ticks: {
          color: "#22291f",
          font: {
            size: 11,
          },
        },

        grid: {
          display: false,
        },
      },

      y: {
        beginAtZero: true,

        ticks: {
          color: "#22291f",
        },

        grid: {
          color: "#e6e1d3",
        },
      },
    },
  };

  return (
    <div className="grafico-contenedor">
      <Bar data={data} options={options} />
    </div>
  );
}
