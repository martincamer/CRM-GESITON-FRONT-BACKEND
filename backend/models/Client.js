import mongoose from "mongoose";

// Esquema para items/productos en documentos
const ItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  description: String,
  quantity: Number,
  unitPrice: Number,
  taxRate: Number,
  discount: Number,
  subtotal: Number,
});

// Esquema para facturas de venta
const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
  },
  invoiceType: {
    type: String,
    required: true,
    enum: ["A", "B", "C", "M", "E"],
  },
  date: {
    type: Date,
    required: true,
  },
  dueDate: Date,
  paymentMethod: {
    type: String,
    required: true,
    enum: ["EFECTIVO", "TRANSFERENCIA", "CHEQUE", "TARJETA", "OTROS"],
  },
  items: [ItemSchema],
  subtotal: {
    type: Number,
    required: true,
  },
  iva: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["PENDIENTE", "ANULADA", "COMPLETADA"],
    default: "PENDIENTE",
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ["PENDIENTE", "PARCIAL", "PAGADO"],
    default: "PENDIENTE",
  },
  observation: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// Esquema para presupuestos
const QuoteSchema = new mongoose.Schema({
  quoteNumber: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  validUntil: {
    type: Date,
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      description: String,
      quantity: {
        type: Number,
        required: true,
      },
      unitPrice: {
        type: Number,
        required: true,
      },
      discount: {
        type: Number,
        default: 0,
      },
      subtotal: {
        type: Number,
        required: true,
      },
    },
  ],
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["PENDIENTE", "APROBADO", "RECHAZADO", "FACTURADO"],
    default: "PENDIENTE",
  },
  observation: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// Esquema para notas de crédito/débito
const CreditDebitNoteSchema = new mongoose.Schema({
  noteType: {
    type: String,
    enum: ["CREDITO", "DEBITO"],
    required: true,
  },
  noteNumber: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  relatedInvoice: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  items: [
    {
      description: String,
      quantity: Number,
      unitPrice: Number,
      discount: Number,
      subtotal: Number,
    },
  ],
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["PENDIENTE", "APLICADO", "ANULADO"],
    default: "PENDIENTE",
  },
  observation: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// Esquema para remitos de venta
const DeliveryNoteSchema = new mongoose.Schema({
  remitNumber: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  relatedInvoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice",
  },
  deliveredBy: String,
  items: [ItemSchema],
  transportData: {
    company: String,
    driver: String,
    vehiclePlate: String,
  },
  status: {
    type: String,
    enum: ["PENDIENTE", "ENTREGADO", "RECHAZADO"],
    default: "PENDIENTE",
  },
  notes: String,
});

// Esquema para pagos
const PaymentSchema = new mongoose.Schema({
  paymentNumber: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ["EFECTIVO", "TRANSFERENCIA", "CHEQUE", "TARJETA", "OTROS"],
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  reference: String,
  status: {
    type: String,
    enum: ["PENDIENTE", "CONFIRMADO", "RECHAZADO"],
    default: "PENDIENTE",
  },
  // Facturas a las que se aplica el pago
  invoices: [
    {
      invoice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Invoice",
        required: true,
      },
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],
  observation: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// Esquema principal del Cliente
const ClientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    businessName: {
      type: String,
      required: [true, "El nombre o razón social es obligatorio"],
      trim: true,
    },
    fantasyName: {
      type: String,
      trim: true,
    },
    documentType: {
      type: String,
      required: true,
      enum: ["DNI", "CUIT", "CUIL"],
    },
    documentNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    taxCondition: {
      type: String,
      required: true,
      enum: [
        "RESPONSABLE_INSCRIPTO",
        "MONOTRIBUTO",
        "CONSUMIDOR_FINAL",
        "EXENTO",
      ],
    },
    contact: {
      email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Email inválido"],
      },
      phone: String,
      alternativePhone: String,
    },
    address: {
      street: String,
      number: String,
      floor: String,
      apartment: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: "Argentina",
      },
    },
    contactPerson: [
      {
        name: String,
        position: String,
        phone: String,
        email: String,
      },
    ],
    paymentInfo: {
      preferredPaymentMethods: [String],
      defaultDueDays: {
        type: Number,
        default: 0,
      },
      creditLimit: {
        type: Number,
        default: 0,
      },
    },
    documents: {
      invoices: [InvoiceSchema],
      quotes: [QuoteSchema],
      creditDebitNotes: [CreditDebitNoteSchema],
      deliveryNotes: [DeliveryNoteSchema],
      payments: [PaymentSchema],
    },
    balance: {
      current: {
        type: Number,
        default: 0,
      },
      lastUpdate: Date,
    },
    category: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: String,
  },
  {
    timestamps: true,
    methods: {
      // Calcular saldo actual
      async updateBalance() {
        let balance = 0;

        // Sumar facturas pendientes
        this.documents.invoices.forEach((inv) => {
          if (inv.paymentStatus !== "PAGADO") {
            balance += inv.total;
          }
        });

        // Restar notas de crédito
        this.documents.creditDebitNotes.forEach((note) => {
          if (note.noteType === "CREDITO" && note.status === "APLICADO") {
            balance -= note.total;
          } else if (note.noteType === "DEBITO" && note.status === "APLICADO") {
            balance += note.total;
          }
        });

        this.balance.current = balance;
        this.balance.lastUpdate = new Date();
        await this.save();
      },

      // Verificar límite de crédito
      canCreateInvoice(amount) {
        return (
          this.paymentInfo.creditLimit === 0 ||
          this.balance.current + amount <= this.paymentInfo.creditLimit
        );
      },

      // Obtener documentos pendientes de pago
      getPendingInvoices() {
        return this.documents.invoices.filter(
          (inv) => inv.paymentStatus !== "PAGADO"
        );
      },
    },
  }
);

// Índices
ClientSchema.index({ businessName: 1, userId: 1 });
ClientSchema.index({ documentNumber: 1 }, { unique: true });
ClientSchema.index({ "documents.invoices.invoiceNumber": 1 });
ClientSchema.index({ "documents.quotes.quoteNumber": 1 });
ClientSchema.index({ isActive: 1 });

// Middleware pre-save
ClientSchema.pre("save", async function (next) {
  if (
    this.isModified("documents") &&
    !this.$__.saveOptions?.timestamps === false
  ) {
    const balance = this.documents.invoices.reduce((acc, inv) => {
      if (inv.paymentStatus !== "PAGADO") {
        return acc + inv.total;
      }
      return acc;
    }, 0);

    // Ajustar por notas de crédito/débito
    if (this.documents.creditDebitNotes) {
      this.documents.creditDebitNotes.forEach((note) => {
        if (note.status === "APLICADO") {
          if (note.noteType === "CREDITO") {
            balance -= note.total;
          } else if (note.noteType === "DEBITO") {
            balance += note.total;
          }
        }
      });
    }

    this.balance = {
      current: balance,
      lastUpdate: new Date(),
    };
  }
  next();
});

const Client = mongoose.model("Client", ClientSchema);

export default Client;
