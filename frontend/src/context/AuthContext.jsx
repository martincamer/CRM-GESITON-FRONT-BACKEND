import { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import clienteAxios from "../config/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    const savedAuth = localStorage.getItem("auth");

    if (token && savedAuth) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp > currentTime) {
          clienteAxios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${token}`;
          return JSON.parse(savedAuth);
        }
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("auth");
        return {};
      }
    }
    return {};
  });

  const login = async (credentials) => {
    try {
      if (credentials.token && credentials.user) {
        const authData = {
          token: credentials.token,
          user: credentials.user,
        };
        setAuth(authData);
        localStorage.setItem("token", credentials.token);
        localStorage.setItem("auth", JSON.stringify(authData));
        clienteAxios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${credentials.token}`;
        return { success: true };
      }

      const response = await clienteAxios.post("/users/login", {
        email: credentials.email,
        password: credentials.password,
      });

      const userData = response.data;

      if (userData) {
        const authData = {
          token: userData.token,
          user: {
            _id: userData._id,
            username: userData.username,
            nombre: userData.nombre,
            apellido: userData.apellido,
            email: userData.email,
          },
        };

        setAuth(authData);
        localStorage.setItem("token", userData.token);
        localStorage.setItem("auth", JSON.stringify(authData));
        clienteAxios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${userData.token}`;

        return { success: true };
      }

      return {
        success: false,
        message: "Credenciales inválidas",
      };
    } catch (error) {
      console.error("Error en login:", error);
      if (error.response) {
        console.error("Datos del error:", error.response.data);
        console.error("Estado del error:", error.response.status);
      }
      return {
        success: false,
        message: error.response?.data?.message || "Error al iniciar sesión",
      };
    }
  };

  useEffect(() => {
    const verificarAuth = async () => {
      const token = localStorage.getItem("token");
      const savedAuth = localStorage.getItem("auth");

      if (!token || !savedAuth) {
        setLoading(false);
        return;
      }

      try {
        clienteAxios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;
        const response = await clienteAxios.get("/users/profile");

        const userData = response.data;
        const authData = {
          token,
          user: userData,
        };

        setAuth(authData);
        localStorage.setItem("auth", JSON.stringify(authData));
      } catch (error) {
        console.error("Error de verificación:", error);
        setAuth({});
        localStorage.removeItem("token");
        localStorage.removeItem("auth");
        delete clienteAxios.defaults.headers.common["Authorization"];
      } finally {
        setLoading(false);
      }
    };

    verificarAuth();
  }, []);

  const logout = () => {
    setAuth({});
    localStorage.removeItem("token");
    localStorage.removeItem("auth");
    delete clienteAxios.defaults.headers.common["Authorization"];
  };

  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Estado auth actualizado:", auth);
  }, [auth]);

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        loading,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
