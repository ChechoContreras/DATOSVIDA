const express = require("express");
const cors = require("cors");
const iaRoutes = require("./routes/iaRoutes");

const app = express();
const PORT = process.env.PORT || 4004;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", servicio: "microservicio-ia" });
});

app.use("/api/ia", iaRoutes);

app.listen(PORT, () => {
  console.log(`Microservicio de Inteligencia Artificial escuchando en el puerto ${PORT}`);
});
