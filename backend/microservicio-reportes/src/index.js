const express = require("express");
const cors = require("cors");
const reportesRoutes = require("./routes/reportesRoutes");

const app = express();
const PORT = process.env.PORT || 4005;

app.use(cors({
  exposedHeaders: ["Content-Disposition"],
}));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
  next();
});
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", servicio: "microservicio-reportes" });
});

app.use("/api/reportes", reportesRoutes);

app.listen(PORT, () => {
  console.log(`Microservicio de Reportes escuchando en el puerto ${PORT}`);
});
