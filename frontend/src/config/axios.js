import axios from "axios";

const clienteAxios = axios.create({
  baseURL: "http://localhost:4000/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Agrega un interceptor para ver qué se está enviando
clienteAxios.interceptors.request.use((request) => {
  console.log("Request:", request);
  return request;
});

clienteAxios.interceptors.response.use(
  (response) => {
    console.log("Response:", response);
    return response;
  },
  (error) => {
    console.log("Error:", error.response);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
clienteAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem("token");
      localStorage.removeItem("auth");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Configurar token si existe
const token = localStorage.getItem("token");
if (token) {
  clienteAxios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export default clienteAxios;
