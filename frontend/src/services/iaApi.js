import axios from "axios";

const iaApi = axios.create({
  baseURL: import.meta.env.VITE_IA_API_URL || "http://localhost:4004/api",
});

export default iaApi;
