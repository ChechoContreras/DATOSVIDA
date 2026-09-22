import axios from "axios";

const analiticaApi = axios.create({
  baseURL: import.meta.env.VITE_ANALITICA_API_URL || "http://localhost:4003/api",
});

export default analiticaApi;
