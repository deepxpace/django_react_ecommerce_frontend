import axios from "axios";
import { BASE_URL } from "./constants";

const apiInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default apiInstance;
