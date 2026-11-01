import axios from "axios";

export const API_BASE = `${import.meta.env.VITE_API_URL}/api/v1`;

axios.defaults.withCredentials = true;
