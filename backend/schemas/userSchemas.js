import Joi from "joi";

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "El email es obligatorio",
    "string.email": "Por favor, ingresa un email válido",
    "any.required": "El email es obligatorio",
  }),
  password: Joi.string().required().min(6).messages({
    "string.empty": "La contraseña es obligatoria",
    "string.min": "La contraseña debe tener al menos 6 caracteres",
    "any.required": "La contraseña es obligatoria",
  }),
});

export const registerSchema = Joi.object({
  username: Joi.string().required().min(3).messages({
    "string.empty": "El nombre de usuario es obligatorio",
    "string.min": "El nombre de usuario debe tener al menos 3 caracteres",
    "any.required": "El nombre de usuario es obligatorio",
  }),
  nombre: Joi.string().required().messages({
    "string.empty": "El nombre es obligatorio",
    "any.required": "El nombre es obligatorio",
  }),
  apellido: Joi.string().required().messages({
    "string.empty": "El apellido es obligatorio",
    "any.required": "El apellido es obligatorio",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "El email es obligatorio",
    "string.email": "Por favor, ingresa un email válido",
    "any.required": "El email es obligatorio",
  }),
  password: Joi.string().required().min(6).messages({
    "string.empty": "La contraseña es obligatoria",
    "string.min": "La contraseña debe tener al menos 6 caracteres",
    "any.required": "La contraseña es obligatoria",
  }),
});
