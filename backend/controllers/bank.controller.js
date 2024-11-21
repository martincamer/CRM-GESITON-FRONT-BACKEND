import Bank from "../models/Bank.js";

// Obtener banco del usuario
const getBank = async (req, res) => {
  try {
    const bank = await Bank.findOne({ user: req.user.id });

    if (!bank) {
      return res.status(404).json({
        ok: false,
        message: "No se encontró la cuenta bancaria para este usuario",
      });
    }

    res.json({
      ok: true,
      bank,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Error al obtener la cuenta bancaria",
    });
  }
};

// Crear nueva transacción bancaria
const createBankTransaction = async (req, res) => {
  try {
    const {
      type,
      amount,
      description,
      category,
      transactionNumber,
      relatedDocument,
    } = req.body;

    const bank = await Bank.findOne({ user: req.user.id });
    if (!bank) {
      return res.status(404).json({
        ok: false,
        message: "No se encontró la cuenta bancaria para este usuario",
      });
    }

    // Calcular nuevo balance
    let newBalance = bank.balance;
    if (type === "INGRESO") {
      newBalance += amount;
    } else if (type === "EGRESO") {
      if (bank.balance < amount) {
        return res.status(400).json({
          ok: false,
          message: "Saldo insuficiente en cuenta bancaria",
        });
      }
      newBalance -= amount;
    }

    // Crear nueva transacción
    bank.transactions.push({
      type,
      amount,
      description,
      category,
      transactionNumber,
      relatedDocument,
    });

    bank.balance = newBalance;
    bank.lastUpdated = new Date();

    await bank.save();

    res.json({
      ok: true,
      message: "Transacción bancaria creada exitosamente",
      bank,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Error al crear la transacción bancaria",
    });
  }
};

// Inicializar banco si no existe
const initializeBank = async (req, res) => {
  try {
    let bank = await Bank.findOne({ user: req.user.id });

    if (bank) {
      return res.status(400).json({
        ok: false,
        message: "La cuenta bancaria ya existe para este usuario",
      });
    }

    const { accountNumber, bankName, accountType } = req.body;

    bank = new Bank({
      user: req.user.id,
      accountNumber: accountNumber || `${Date.now()}`,
      bankName: bankName || "Banco Principal",
      accountType: accountType || "CORRIENTE",
      balance: 0,
      transactions: [],
    });

    await bank.save();

    res.json({
      ok: true,
      message: "Cuenta bancaria inicializada exitosamente",
      bank,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Error al inicializar la cuenta bancaria",
    });
  }
};

export { getBank, createBankTransaction, initializeBank };
