import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import clienteAxios from "../config/axios";
import Input from "../components/ui/Input";
import InputPassword from "../components/ui/InputPassword";
import GoogleButton from "../components/ui/GoogleButton";
import { useGoogleLogin } from "@react-oauth/google";

const Registro = () => {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm({
    defaultValues: {
      username: "",
      nombre: "",
      apellido: "",
      email: "",
      password: "",
    },
  });

  const navigate = useNavigate();

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

        // Si el registro fue exitoso, iniciar sesión
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
            error.response?.data?.message || "Error al registrar con Google",
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

  const onSubmit = async (formData) => {
    try {
      await clienteAxios.post("/users/register", formData);
      navigate("/login");
    } catch (error) {
      setFormError("root", {
        type: "manual",
        message: error.response?.data?.message || "Error al registrar usuario",
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://app.getbillage.com/saas/img/icons/backgrounds/pc_billage.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-blue-500/80"></div>

        <div className="relative z-10">
          <div className="absolute top-8 left-8">
            <img
              src="https://app.getbillage.com/saas/img/logo/billage.svg"
              alt="Logo"
              className="h-16"
            />
          </div>
          <div className="flex flex-col justify-center h-full px-20 text-white">
            <h2 className="text-4xl font-bold mb-4">
              Bienvenido a nuestro CRM
            </h2>
            <p className="text-blue-100 text-lg">
              Gestiona tus clientes de manera eficiente y profesional
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="p-6 flex justify-end">
          <Link
            to="/login"
            className="px-6 py-2 border-2 border-blue-500 text-blue-500 rounded-full hover:bg-blue-50 transition-colors"
          >
            Ya tengo cuenta
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-md">
            <div className="mb-5 text-center">
              <h1 className="text-2xl font-bold text-gray-800">Crear cuenta</h1>
              <p className="text-gray-500 mt-2">
                Completa el formulario para comenzar
              </p>
            </div>

            {errors.root && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                {errors.root.message}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Nombre de usuario"
                {...register("username", {
                  required: "El nombre de usuario es requerido",
                })}
                error={errors.username?.message}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  {...register("nombre", {
                    required: "El nombre es requerido",
                  })}
                  error={errors.nombre?.message}
                />

                <Input
                  label="Apellido"
                  {...register("apellido", {
                    required: "El apellido es requerido",
                  })}
                  error={errors.apellido?.message}
                />
              </div>

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

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-500 text-white rounded-full hover:bg-blue-400 transition-colors"
                >
                  Crear cuenta
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
                  text="Registrarse con Google"
                  onClick={() => handleGoogleLogin()}
                />
              </div>
            </form>

            <p className="mt-8 text-sm text-center text-gray-500">
              Al registrarte, aceptas nuestros{" "}
              <a href="/terminos" className="text-blue-500 hover:text-blue-400">
                términos y condiciones
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registro;
