const express = require("express");
const cors = require("cors");
const indicadorRoutes = require("./routes/indicadorRoutes");

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", servicio: "microservicio-indicadores" });
});

app.use("/api", indicadorRoutes);

app.listen(PORT, () => {
  console.log(`Microservicio de Indicadores escuchando en el puerto ${PORT}`);
});
