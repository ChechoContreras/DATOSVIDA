
import axios from "axios";

/**
 * DATAVIDA - Cliente HTTP centralizado
 *
 * Conexión entre el frontend React
 * y el backend alojado en Render.
 *
 * Si existe VITE_API_URL, se utiliza.
 * De lo contrario, se conecta a
 * la API pública de DATAVIDA.
 */

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://datavida-api.onrender.com/api",

  timeout: 30000,
});

export default api;
