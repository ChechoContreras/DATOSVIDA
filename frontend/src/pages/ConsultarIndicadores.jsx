import { useIndicadores } from "../hooks/useIndicadores";
import FiltrosIndicadores from "../components/FiltrosIndicadores";
import GraficoIndicadores from "../components/GraficoIndicadores";
import TarjetasIndicadores from "../components/TarjetasIndicadores";

export default function ConsultarIndicadores() {
  const {
    datos,
    municipios,
    catalogoIndicadores,
    cargando,
    error,
    mensaje,
    buscar,
  } = useIndicadores();

  return (
    <section className="pagina-consulta">
      <header className="pagina-consulta__encabezado">
        <p className="pagina-consulta__etiqueta">Microservicio de Indicadores</p>
        <h1>Consultar Índice de Pobreza Multidimensional</h1>
        <p>Filtra por municipio, indicador y periodo para ver los valores oficiales.</p>
      </header>

      <FiltrosIndicadores
        municipios={municipios}
        catalogoIndicadores={catalogoIndicadores}
        onBuscar={buscar}
      />

      {cargando && <p className="estado-carga">Consultando indicadores…</p>}
      {error && <p className="estado-error">{error}</p>}

      {!cargando && !error && (
        <>
          <p className="mensaje-resultado">{mensaje}</p>
          <GraficoIndicadores datos={datos} />
          <TarjetasIndicadores datos={datos} />
        </>
      )}
    </section>
  );
}
