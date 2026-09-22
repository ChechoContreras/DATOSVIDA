import axios from "axios";

const reportesApi = axios.create({
  baseURL: import.meta.env.VITE_REPORTES_API_URL || "http://localhost:4005/api",
});

export default reportesApi;
