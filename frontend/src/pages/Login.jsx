import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useGoogleLogin } from "@react-oauth/google";
import Input from "../components/ui/Input";
import InputPassword from "../components/ui/InputPassword";
import GoogleButton from "../components/ui/GoogleButton";
import { useEffect } from "react";
import clienteAxios from "../config/clienteAxios";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm();

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login | Gestión Ecommerce";
  }, []);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        // Obtener información del usuario de Google
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${response.access_token}`,
            },
          }
        );

        const userInfo = await userInfoResponse.json();

        // Enviar datos al backend
        const { data } = await clienteAxios.post("/users/google", {
          email: userInfo.email,
          given_name: userInfo.given_name,
          family_name: userInfo.family_name,
          sub: userInfo.sub,
        });

        // Si el login fue exitoso
        if (data.token) {
          login({
            token: data.token,
            user: {
              _id: data._id,
              username: data.username,
              nombre: data.nombre,
              apellido: data.apellido,
              email: data.email,
            },
          });

          navigate("/dashboard");
        }
      } catch (error) {
        setFormError("root", {
          type: "manual",
          message:
            error.response?.data?.message ||
            "Error al iniciar sesión con Google",
        });
      }
    },
    onError: () => {
      setFormError("root", {
        type: "manual",
        message: "Error al conectar con Google",
      });
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await login(data);
      if (response.success) {
        navigate("/dashboard");
      } else {
        setFormError("root", {
          type: "manual",
          message: response.message || "Error al iniciar sesión",
        });
      }
    } catch (error) {
      setFormError("root", {
        type: "manual",
        message: "Error al conectar con el servidor",
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel Izquierdo */}
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://app.getbillage.com/saas/img/icons/backgrounds/pc_billage.jpg')",
        }}
      >
        {/* Overlay azul semi-transparente */}
        <div className="absolute inset-0 bg-blue-500/80"></div>

        {/* Contenido sobre el overlay */}
        <div className="relative z-10">
          <div className="absolute top-8 left-8">
            <img
              src="https://app.getbillage.com/saas/img/logo/billage.svg"
              alt="Logo"
              className="h-16"
            />
          </div>
          <div className="flex flex-col justify-center h-full px-20 text-white">
            <h2 className="text-4xl font-bold mb-4">¡Bienvenido de nuevo!</h2>
            <p className="text-blue-100 text-lg">
              Accede a tu cuenta para gestionar tu negocio
            </p>
          </div>
        </div>
      </div>

      {/* Panel Derecho */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="p-6 flex justify-end">
          <Link
            to="/registro"
            className="px-6 py-2 border-2 border-blue-500 text-blue-500 rounded-full hover:bg-blue-50 transition-colors"
          >
            Crear cuenta
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-md">
            <div className="mb-5 text-center">
              <h1 className="text-2xl font-bold text-gray-800">
                Iniciar Sesión
              </h1>
              <p className="text-gray-500 mt-2">
                Ingresa tus credenciales para continuar
              </p>
            </div>

            {errors.root && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                {errors.root.message}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Email"
                type="email"
                {...register("email", {
                  required: "El email es requerido",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email inválido",
                  },
                })}
                error={errors.email?.message}
              />

              <InputPassword
                label="Contraseña"
                {...register("password", {
                  required: "La contraseña es requerida",
                  minLength: {
                    value: 6,
                    message: "Mínimo 6 caracteres",
                  },
                })}
                error={errors.password?.message}
              />

              <div className="flex justify-end">
                <Link
                  to="/recuperar-password"
                  className="text-sm text-blue-500 hover:text-blue-400"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-500 text-white rounded-full hover:bg-blue-400 transition-colors"
                >
                  Iniciar Sesión
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-gray-500 text-sm">
                      o
                    </span>
                  </div>
                </div>

                <GoogleButton
                  onClick={() => handleGoogleLogin()}
                  text="Iniciar sesión con Google"
                />
              </div>
            </form>

            <p className="mt-8 text-sm text-center text-gray-500">
              ¿No tienes una cuenta?{" "}
              <Link
                to="/registro"
                className="text-blue-500 hover:text-blue-400"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
