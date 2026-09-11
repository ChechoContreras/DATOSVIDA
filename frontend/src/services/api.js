import axios from "axios";

/**
 * Cliente HTTP centralizado hacia el backend.
 * En la arquitectura final esto apuntará al API Gateway; por ahora,
 * mientras solo existe el Microservicio de Indicadores, apunta
 * directamente a él.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4001/api",
});

export default api;
