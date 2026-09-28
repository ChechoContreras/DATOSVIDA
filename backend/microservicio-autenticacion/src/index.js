const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const { inicializarDB } = require("./config/inicializarDB");

const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    servicio: "microservicio-autenticacion",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes);

/**
 * Primero conecta e inicializa PostgreSQL.
 * Solo después inicia el servidor HTTP.
 */
async function iniciarServidor() {
  try {
    await inicializarDB();

    app.listen(PORT, () => {
      console.log(
        `Microservicio de Autenticación escuchando en el puerto ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "No fue posible iniciar el Microservicio de Autenticación:",
      error
    );
    process.exit(1);
  }
}

iniciarServidor();
