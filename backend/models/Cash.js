import mongoose from "mongoose";

const cashTransactionSchema = new mongoose.Schema(
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
        "VENTA",
        "COMPRA",
        "PAGO_PROVEEDOR",
        "GASTO",
        "TRANSFERENCIA_BANCO",
        "DEPOSITO",
        "EXTRACCION",
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
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const cashSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    transactions: [cashTransactionSchema],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Cash", cashSchema);
