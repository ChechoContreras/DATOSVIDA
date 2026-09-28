const express = require("express");
const cors = require("cors");
const indicadorRoutes = require("./routes/indicadorRoutes");
const pool = require("./config/database");

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
    // Verifica que PostgreSQL esté disponible antes de iniciar el servicio.
    await pool.query("SELECT NOW()");

    console.log("Base de datos PostgreSQL conectada correctamente.");

    app.listen(PORT, () => {
      console.log(
        `Microservicio de Indicadores escuchando en el puerto ${PORT}`
      );
    });
  } catch (error) {
    console.error("Error al conectar con PostgreSQL:", error.message);
    process.exit(1);
  }
}

iniciarServidor();
