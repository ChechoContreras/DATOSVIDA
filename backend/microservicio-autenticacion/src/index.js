const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");

const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", servicio: "microservicio-autenticacion" });
});

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes);

app.listen(PORT, () => {
  console.log(`Microservicio de Autenticación escuchando en el puerto ${PORT}`);
});
