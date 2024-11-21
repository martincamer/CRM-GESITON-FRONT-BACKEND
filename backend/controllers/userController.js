import User from "../models/User.js";
import Cash from "../models/Cash.js";
import Bank from "../models/Bank.js";
import jwt from "jsonwebtoken";
import { loginSchema, registerSchema } from "../schemas/userSchemas.js";
import { initializeUserAccounts } from "../utils/initializeAccounts.js";

// Generar JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

// Registrar usuario
const register = async (req, res) => {
  try {
    // Validar datos de entrada
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const { username, email } = req.body;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (userExists) {
      return res.status(400).json({
        message:
          userExists.email === email
            ? "Ya existe una cuenta con este email"
            : "El nombre de usuario ya está en uso",
      });
    }

    // Crear usuario
    const user = await User.create(req.body);

    // Inicializar caja y banco
    const cash = new Cash({
      user: user._id,
      balance: 0,
      transactions: [],
    });

    const bank = new Bank({
      user: user._id,
      accountNumber: `${Date.now()}`,
      bankName: "Banco Principal",
      accountType: "CORRIENTE",
      balance: 0,
      transactions: [],
    });

    // Guardar todo
    await Promise.all([cash.save(), bank.save()]);

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error en el servidor",
    });
  }
};

// Login usuario
const login = async (req, res) => {
  try {
    // Validar datos de entrada
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const { email, password } = req.body;

    // Verificar si el usuario existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "No existe una cuenta con este email",
      });
    }

    // Verificar password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: "La contraseña es incorrecta",
      });
    }

    // Generar token y enviar respuesta
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      username: user.username,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error en el servidor",
    });
  }
};

// Obtener perfil de usuario
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error en el servidor",
    });
  }
};

const registerWithGoogle = async (req, res) => {
  try {
    const { email, given_name, family_name, sub } = req.body;

    // Verifica si el usuario ya existe
    let user = await User.findOne({ email });

    if (user) {
      // Verificar si tiene caja y banco
      const { cash, bank } = await initializeUserAccounts(user._id);

      const token = generateToken(user._id);
      return res.json({
        _id: user._id,
        username: user.username,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        token,
      });
    }

    // Si no existe, créalo
    user = await User.create({
      username: email.split("@")[0],
      nombre: given_name,
      apellido: family_name,
      email,
      password: sub,
      googleId: sub,
      verificado: true,
    });

    // Inicializar caja y banco
    const cash = new Cash({
      user: user._id,
      balance: 0,
      transactions: [],
    });

    const bank = new Bank({
      user: user._id,
      accountNumber: `${Date.now()}`,
      bankName: "Banco Principal",
      accountType: "CORRIENTE",
      balance: 0,
      transactions: [],
    });

    // Guardar caja y banco
    await Promise.all([cash.save(), bank.save()]);

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      username: user.username,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error en el servidor",
    });
  }
};

// Nuevo método para verificar/crear caja y banco
const initializeAccounts = async (req, res) => {
  try {
    const { cash, bank } = await initializeUserAccounts(req.user._id);

    res.json({
      message: "Cuentas inicializadas correctamente",
      cash,
      bank,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al inicializar las cuentas",
    });
  }
};

export { register, login, getProfile, registerWithGoogle, initializeAccounts };
