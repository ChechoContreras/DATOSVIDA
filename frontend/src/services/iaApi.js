
import axios from "axios";

const iaApi = axios.create({
  baseURL:
    import.meta.env.VITE_IA_API_URL ||
    "https://datavida-ia.onrender.com/api",
  timeout: 30000,
});

export default iaApi;
