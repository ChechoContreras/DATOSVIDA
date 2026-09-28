const express = require("express");
const cors = require("cors");
const indicadorRoutes = require("./routes/indicadorRoutes");
const pool = require("./config/database");
const inicializarDatabase = require("./config/inicializarDatabase");

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", servicio: "microservicio-indicadores" });
});

app.use("/api", indicadorRoutes);

async function iniciarServidor() {
  try {
    // Verifica que PostgreSQL esté disponible.
    await pool.query("SELECT NOW()");

    console.log("Base de datos PostgreSQL conectada correctamente.");

    // Crea las tablas necesarias si todavía no existen.
    await inicializarDatabase();

    console.log("Base de datos de indicadores inicializada correctamente.");

    app.listen(PORT, () => {
      console.log(
        `Microservicio de Indicadores escuchando en el puerto ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Error al inicializar PostgreSQL:",
      error.message
    );
    process.exit(1);
  }
}

iniciarServidor();
