import Cash from "../models/Cash.js";
import Bank from "../models/Bank.js";
import { initializeUserAccounts } from "../utils/initializeAccounts.js";

// Obtener caja del usuario
const getCash = async (req, res) => {
  try {
    const { cash, bank } = await initializeUserAccounts(req.user.id);

    if (!cash) {
      return res.status(404).json({
        ok: false,
        message: "No se encontró la caja para este usuario",
      });
    }

    res.json({
      ok: true,
      cash,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Error al obtener la caja",
    });
  }
};

// Crear nueva transacción en caja
const createCashTransaction = async (req, res) => {
  try {
    const { type, amount, description, category } = req.body;

    // Validaciones iniciales
    if (!type || !amount || !description || !category) {
      return res.status(400).json({
        ok: false,
        message: "Todos los campos son obligatorios",
        details: {
          type: !type ? "El tipo es requerido" : null,
          amount: !amount ? "El monto es requerido" : null,
          description: !description ? "La descripción es requerida" : null,
          category: !category ? "La categoría es requerida" : null,
        },
      });
    }

    const { cash } = await initializeUserAccounts(req.user.id);
    if (!cash) {
      return res.status(404).json({
        ok: false,
        message: "No se encontró la caja para este usuario",
      });
    }

    // Validar el monto
    if (amount <= 0) {
      return res.status(400).json({
        ok: false,
        message: "El monto debe ser mayor a cero",
      });
    }

    // Validar saldo suficiente para egresos
    if (type === "EGRESO" && cash.balance < amount) {
      return res.status(400).json({
        ok: false,
        message: `Saldo insuficiente. Saldo actual: ${new Intl.NumberFormat(
          "es-AR",
          {
            style: "currency",
            currency: "ARS",
          }
        ).format(cash.balance)}`,
        currentBalance: cash.balance,
      });
    }

    // Crear la transacción
    const newTransaction = {
      type,
      amount,
      description,
      category,
      date: new Date(),
    };

    // Actualizar balance
    cash.balance =
      type === "INGRESO" ? cash.balance + amount : cash.balance - amount;
    cash.transactions.push(newTransaction);
    cash.lastUpdated = new Date();

    await cash.save();

    res.json({
      ok: true,
      message: "Transacción creada exitosamente",
      cash,
    });
  } catch (error) {
    console.error("Error en createCashTransaction:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        ok: false,
        message: "Error de validación",
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }
    res.status(500).json({
      ok: false,
      message: "Error al crear la transacción",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Transferir entre caja y banco
const transferCashBank = async (req, res) => {
  try {
    const { fromType, toType, amount, description } = req.body;

    if (amount <= 0) {
      return res.status(400).json({
        ok: false,
        message: "El monto debe ser mayor a 0",
      });
    }

    const { cash, bank } = await initializeUserAccounts(req.user.id);

    if (!cash || !bank) {
      return res.status(404).json({
        ok: false,
        message: "No se encontró la caja o banco para este usuario",
      });
    }

    // Validar saldo suficiente
    if (fromType === "CAJA" && cash.balance < amount) {
      return res.status(400).json({
        ok: false,
        message: "Saldo insuficiente en caja",
      });
    }
    if (fromType === "BANCO" && bank.balance < amount) {
      return res.status(400).json({
        ok: false,
        message: "Saldo insuficiente en banco",
      });
    }

    // Crear transacciones
    const transferId = new mongoose.Types.ObjectId();

    if (fromType === "CAJA") {
      cash.balance -= amount;
      bank.balance += amount;

      cash.transactions.push({
        type: "EGRESO",
        amount,
        description,
        category: "TRANSFERENCIA_BANCO",
        relatedDocument: {
          type: "TRANSFERENCIA",
          documentId: transferId,
        },
      });

      bank.transactions.push({
        type: "INGRESO",
        amount,
        description,
        category: "TRANSFERENCIA_CAJA",
        relatedDocument: {
          type: "TRANSFERENCIA",
          documentId: transferId,
        },
      });
    } else {
      bank.balance -= amount;
      cash.balance += amount;

      bank.transactions.push({
        type: "EGRESO",
        amount,
        description,
        category: "TRANSFERENCIA_CAJA",
        relatedDocument: {
          type: "TRANSFERENCIA",
          documentId: transferId,
        },
      });

      cash.transactions.push({
        type: "INGRESO",
        amount,
        description,
        category: "TRANSFERENCIA_BANCO",
        relatedDocument: {
          type: "TRANSFERENCIA",
          documentId: transferId,
        },
      });
    }

    await Promise.all([cash.save(), bank.save()]);

    res.json({
      ok: true,
      message: "Transferencia realizada exitosamente",
      cash,
      bank,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Error al realizar la transferencia",
    });
  }
};

// Inicializar caja si no existe
const initializeCash = async (req, res) => {
  try {
    let cash = await Cash.findOne({ user: req.user.id });

    if (cash) {
      return res.status(400).json({
        ok: false,
        message: "La caja ya existe para este usuario",
      });
    }

    cash = new Cash({
      user: req.user.id,
      balance: 0,
      transactions: [],
    });

    await cash.save();

    res.json({
      ok: true,
      message: "Caja inicializada exitosamente",
      cash,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Error al inicializar la caja",
    });
  }
};

export { getCash, createCashTransaction, transferCashBank, initializeCash };
