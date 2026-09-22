import axios from "axios";
import { obtenerToken } from "../utils/auth";

/**
 * Cliente HTTP hacia el Microservicio de Autenticación.
 * En la arquitectura final esto apuntará al API Gateway.
 */
const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL || "http://localhost:4002/api",
});

// Interceptor (rol "Interceptors" de la arquitectura frontend): adjunta
// el token JWT a cada petición saliente, cuando exista una sesión activa.
authApi.interceptors.request.use((config) => {
  const token = obtenerToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default authApi;
