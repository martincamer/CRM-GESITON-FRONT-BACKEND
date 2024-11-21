import Cash from "../models/Cash.js";
import Bank from "../models/Bank.js";

export const initializeUserAccounts = async (userId) => {
  try {
    // Verificar si ya existe la caja
    let cash = await Cash.findOne({ user: userId });
    if (!cash) {
      cash = new Cash({
        user: userId,
        balance: 0,
        transactions: [],
      });
      await cash.save();
    }

    // Verificar si ya existe el banco
    let bank = await Bank.findOne({ user: userId });
    if (!bank) {
      bank = new Bank({
        user: userId,
        accountNumber: `${Date.now()}`,
        bankName: "Banco Principal",
        accountType: "CORRIENTE",
        balance: 0,
        transactions: [],
      });
      await bank.save();
    }

    return { cash, bank };
  } catch (error) {
    console.error("Error inicializando cuentas:", error);
    throw error;
  }
};
