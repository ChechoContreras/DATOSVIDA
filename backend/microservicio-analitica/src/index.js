const express = require("express");
const cors = require("cors");
const analisisRoutes = require("./routes/analisisRoutes");

const app = express();
const PORT = process.env.PORT || 4003;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", servicio: "microservicio-analitica" });
});

app.use("/api/analitica", analisisRoutes);

app.listen(PORT, () => {
  console.log(`Microservicio de Analítica escuchando en el puerto ${PORT}`);
});
