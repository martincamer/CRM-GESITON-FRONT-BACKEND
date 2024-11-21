import mongoose from "mongoose";

const bankTransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["INGRESO", "EGRESO", "TRANSFERENCIA"],
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "DEPOSITO",
        "EXTRACCION",
        "TRANSFERENCIA_CAJA",
        "PAGO_PROVEEDOR",
        "COBRO_CLIENTE",
        "OTROS",
      ],
    },
    relatedDocument: {
      type: {
        type: String,
        enum: ["FACTURA", "ORDEN_COMPRA", "TRANSFERENCIA", "OTRO"],
      },
      documentId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "relatedDocument.type",
      },
    },
    transactionNumber: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const bankSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    accountNumber: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    accountType: {
      type: String,
      required: true,
      enum: ["CORRIENTE", "AHORRO"],
    },
    balance: {
      type: Number,
      default: 0,
    },
    transactions: [bankTransactionSchema],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Bank", bankSchema);
