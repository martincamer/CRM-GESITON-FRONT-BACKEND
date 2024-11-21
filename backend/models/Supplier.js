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
  subtotal: Number,
});

// Esquema para facturas
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
  items: [ItemSchema],
  subtotal: Number,
  taxAmount: Number,
  total: Number,
  paymentStatus: {
    type: String,
    enum: ["PENDIENTE", "PARCIAL", "PAGADO"],
    default: "PENDIENTE",
  },
  paymentMethod: {
    type: String,
    enum: ["EFECTIVO", "TRANSFERENCIA", "CHEQUE", "OTROS"],
  },
  notes: String,
});

// Esquema para órdenes de compra
const PurchaseOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  expectedDeliveryDate: Date,
  status: {
    type: String,
    enum: ["PENDIENTE", "PARCIAL", "COMPLETADA", "CANCELADA"],
    default: "PENDIENTE",
  },
  items: [ItemSchema],
  subtotal: Number,
  taxAmount: Number,
  total: Number,
  notes: String,
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
  relatedInvoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice",
  },
  date: {
    type: Date,
    required: true,
  },
  reason: String,
  items: [ItemSchema],
  subtotal: Number,
  taxAmount: Number,
  total: Number,
  status: {
    type: String,
    enum: ["PENDIENTE", "APLICADO"],
    default: "PENDIENTE",
  },
  notes: String,
});

// Esquema para remitos
const DeliveryNoteSchema = new mongoose.Schema({
  remitNumber: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  purchaseOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PurchaseOrder",
  },
  receivedBy: String,
  items: [ItemSchema],
  transportData: {
    company: String,
    driver: String,
    vehiclePlate: String,
  },
  status: {
    type: String,
    enum: ["PENDIENTE", "RECIBIDO", "RECHAZADO"],
    default: "PENDIENTE",
  },
  notes: String,
});

// Esquema de pagos
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
    enum: ["EFECTIVO", "TRANSFERENCIA", "CHEQUE", "OTROS"],
  },
  amount: {
    type: Number,
    required: true,
  },
  reference: String,
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BankAccount",
  },
  invoices: [
    {
      invoice: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
    },
  ],
  status: {
    type: String,
    enum: ["PENDIENTE", "COMPLETADO", "ANULADO"],
    default: "COMPLETADO",
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

// Esquema principal del Proveedor
const SupplierSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    businessName: {
      type: String,
      required: [true, "La razón social es obligatoria"],
      trim: true,
    },
    fantasyName: {
      type: String,
      trim: true,
    },
    cuit: {
      type: String,
      required: [true, "El CUIT es obligatorio"],
      unique: true,
      trim: true,
      match: [
        /^\d{2}-\d{8}-\d{1}$/,
        "El formato del CUIT debe ser XX-XXXXXXXX-X",
      ],
    },
    taxCondition: {
      type: String,
      required: true,
      enum: {
        values: [
          "RESPONSABLE_INSCRIPTO",
          "MONOTRIBUTO",
          "EXENTO",
          "CONSUMIDOR_FINAL",
        ],
        message: "{VALUE} no es una condición fiscal válida",
      },
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
      website: String,
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
        department: String,
      },
    ],
    bankAccounts: [
      {
        bankName: String,
        accountType: String,
        accountNumber: String,
        cbu: String,
        alias: String,
      },
    ],
    balance: {
      current: {
        type: Number,
        default: 0,
      },
      lastUpdate: Date,
    },
    paymentConditions: {
      defaultDueDays: Number,
      creditLimit: Number,
      paymentMethods: [String],
    },
    documents: {
      invoices: [InvoiceSchema],
      purchaseOrders: [PurchaseOrderSchema],
      creditDebitNotes: [CreditDebitNoteSchema],
      deliveryNotes: [DeliveryNoteSchema],
      payments: [PaymentSchema],
    },
    categories: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Índices
SupplierSchema.index({ businessName: 1, userId: 1 }, { unique: true });
SupplierSchema.index({ cuit: 1 }, { unique: true });
SupplierSchema.index({ "documents.invoices.invoiceNumber": 1 });
SupplierSchema.index({ "documents.purchaseOrders.orderNumber": 1 });
SupplierSchema.index({ isActive: 1 });

// export default mongoose.model("Supplier", SupplierSchema);
export default mongoose.model("Supplier", SupplierSchema);
