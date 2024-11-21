import mongoose from "mongoose";

// Schema para los items de la factura
const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  subtotal: {
    type: Number,
    required: true,
  },
});

// Schema para los pagos recibidos
const paymentSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    method: {
      type: String,
      required: true,
      enum: ["EFECTIVO", "TRANSFERENCIA", "CHEQUE", "TARJETA", "OTROS"],
    },
    reference: String,
    notes: String,
  },
  { timestamps: true }
);

// Schema principal de ventas
const saleSchema = new mongoose.Schema(
  {
    // Información del cliente
    client: {
      name: {
        type: String,
        required: true,
      },
      document: {
        type: String,
        required: true,
      },
      documentType: {
        type: String,
        required: true,
        enum: ["DNI", "CUIT", "CUIL"],
      },
      email: String,
      phone: String,
      address: String,
    },

    // Información de la venta
    saleNumber: {
      type: String,
      required: true,
      unique: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    items: [saleItemSchema],

    // Totales
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },

    // Estado de la venta
    status: {
      type: String,
      required: true,
      enum: ["PENDIENTE", "PARCIAL", "PAGADA", "ANULADA"],
      default: "PENDIENTE",
    },

    // Pagos y saldos
    payments: [paymentSchema],
    balance: {
      type: Number,
      required: true,
    },

    // Documentación
    invoiceType: {
      type: String,
      required: true,
      enum: ["A", "B", "C", "X"],
    },
    invoiceNumber: {
      type: String,
      required: true,
    },

    // Campos de seguimiento
    notes: String,
    attachments: [
      {
        name: String,
        url: String,
        type: String,
      },
    ],

    // Referencias
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Campos de auditoría
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,

    // Middleware para calcular totales
    methods: {
      calculateTotals() {
        // Calcular subtotal
        this.subtotal = this.items.reduce(
          (sum, item) => sum + item.subtotal,
          0
        );

        // Calcular total con impuestos y descuentos
        this.total = this.subtotal + this.tax - this.discount;

        // Calcular saldo
        const totalPaid = this.payments.reduce(
          (sum, payment) => sum + payment.amount,
          0
        );
        this.balance = this.total - totalPaid;

        // Actualizar estado según el saldo
        if (this.balance === 0) {
          this.status = "PAGADA";
        } else if (this.balance === this.total) {
          this.status = "PENDIENTE";
        } else {
          this.status = "PARCIAL";
        }
      },
    },
  }
);

// Middleware pre-save para calcular totales
saleSchema.pre("save", function (next) {
  this.calculateTotals();
  next();
});

export default mongoose.model("Sale", saleSchema);
