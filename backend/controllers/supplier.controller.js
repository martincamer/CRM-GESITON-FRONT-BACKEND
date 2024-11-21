import Supplier from "../models/Supplier.js";
import Cash from "../models/Cash.js";
import Bank from "../models/Bank.js";
import mongoose from "mongoose";

const supplierController = {
  // Crear nuevo proveedor
  createSupplier: async (req, res) => {
    try {
      const {
        businessName,
        fantasyName,
        cuit,
        taxCondition,
        contact,
        address,
        contactPerson,
        bankAccounts,
        paymentConditions,
        categories,
        notes,
      } = req.body;

      // Verificar si ya existe un proveedor con el mismo CUIT
      const existingSupplier = await Supplier.findOne({ cuit });
      if (existingSupplier) {
        return res.status(400).json({
          ok: false,
          message: "Ya existe un proveedor con este CUIT",
        });
      }

      const newSupplier = new Supplier({
        userId: req.user._id,
        businessName,
        fantasyName,
        cuit,
        taxCondition,
        contact,
        address,
        contactPerson,
        bankAccounts,
        paymentConditions,
        categories,
        notes,
        documents: {
          invoices: [],
          purchaseOrders: [],
          creditDebitNotes: [],
          deliveryNotes: [],
        },
      });

      const savedSupplier = await newSupplier.save();
      res.status(201).json({
        ok: true,
        supplier: savedSupplier,
        message: "Proveedor creado exitosamente",
      });
    } catch (error) {
      console.error("Error al crear proveedor:", error);
      res.status(500).json({
        ok: false,
        message: "Error al crear el proveedor",
        error: error.message,
      });
    }
  },

  // Agregar nueva factura
  addInvoice: async (req, res) => {
    try {
      const { supplierId } = req.params;
      const {
        invoiceNumber,
        invoiceType,
        date,
        dueDate,
        items,
        subtotal,
        taxAmount,
        total,
        paymentMethod,
        notes,
      } = req.body;

      const supplier = await Supplier.findOne({
        _id: supplierId,
        userId: req.user._id,
      });

      if (!supplier) {
        return res.status(404).json({
          ok: false,
          message: "Proveedor no encontrado",
        });
      }

      // Verificar si ya existe la factura
      const invoiceExists = supplier.documents.invoices.some(
        (inv) => inv.invoiceNumber === invoiceNumber
      );

      if (invoiceExists) {
        return res.status(400).json({
          ok: false,
          message: "Ya existe una factura con este número",
        });
      }

      // Agregar la nueva factura
      supplier.documents.invoices.push({
        invoiceNumber,
        invoiceType,
        date,
        dueDate,
        items,
        subtotal,
        taxAmount,
        total,
        paymentMethod,
        notes,
      });

      // Actualizar el saldo del proveedor
      supplier.balance.current += total;
      supplier.balance.lastUpdate = new Date();

      const supplierData = await supplier.save();

      res.status(200).json({
        ok: true,
        message: "Factura agregada exitosamente",
        invoice: supplierData,
      });
    } catch (error) {
      console.error("Error al agregar factura:", error);
      res.status(500).json({
        ok: false,
        message: "Error al agregar la factura",
        error: error.message,
      });
    }
  },

  // Agregar orden de compra
  addPurchaseOrder: async (req, res) => {
    try {
      const { supplierId } = req.params;
      const {
        orderNumber,
        date,
        expectedDeliveryDate,
        items,
        subtotal,
        taxAmount,
        total,
        notes,
      } = req.body;

      const supplier = await Supplier.findOne({
        _id: supplierId,
        userId: req.user._id,
      });

      if (!supplier) {
        return res.status(404).json({
          ok: false,
          message: "Proveedor no encontrado",
        });
      }

      // Verificar si ya existe la orden
      const orderExists = supplier.documents.purchaseOrders.some(
        (order) => order.orderNumber === orderNumber
      );

      if (orderExists) {
        return res.status(400).json({
          ok: false,
          message: "Ya existe una orden con este número",
        });
      }

      supplier.documents.purchaseOrders.push({
        orderNumber,
        date,
        expectedDeliveryDate,
        items,
        subtotal,
        taxAmount,
        total,
        notes,
      });

      await supplier.save();

      res.status(200).json({
        ok: true,
        message: "Orden de compra agregada exitosamente",
        purchaseOrder:
          supplier.documents.purchaseOrders[
            supplier.documents.purchaseOrders.length - 1
          ],
      });
    } catch (error) {
      console.error("Error al agregar orden de compra:", error);
      res.status(500).json({
        ok: false,
        message: "Error al agregar la orden de compra",
        error: error.message,
      });
    }
  },

  // Obtener todos los proveedores
  getSuppliers: async (req, res) => {
    try {
      const suppliers = await Supplier.find({ userId: req.user._id }).sort({
        businessName: 1,
      });

      res.status(200).json({
        ok: true,
        suppliers,
      });
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
      res.status(500).json({
        ok: false,
        message: "Error al obtener los proveedores",
        error: error.message,
      });
    }
  },

  // Obtener un proveedor específico con todos sus documentos
  getSupplierById: async (req, res) => {
    try {
      const supplier = await Supplier.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (!supplier) {
        return res.status(404).json({
          ok: false,
          message: "Proveedor no encontrado",
        });
      }

      res.status(200).json({
        ok: true,
        supplier,
      });
    } catch (error) {
      console.error("Error al obtener proveedor:", error);
      res.status(500).json({
        ok: false,
        message: "Error al obtener el proveedor",
        error: error.message,
      });
    }
  },

  // Actualizar proveedor
  updateSupplier: async (req, res) => {
    try {
      const updatedSupplier = await Supplier.findOneAndUpdate(
        {
          _id: req.params.id,
          userId: req.user._id,
        },
        {
          $set: req.body,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedSupplier) {
        return res.status(404).json({
          ok: false,
          message: "Proveedor no encontrado",
        });
      }

      res.status(200).json({
        ok: true,
        supplier: updatedSupplier,
        message: "Proveedor actualizado exitosamente",
      });
    } catch (error) {
      console.error("Error al actualizar proveedor:", error);
      res.status(500).json({
        ok: false,
        message: "Error al actualizar el proveedor",
        error: error.message,
      });
    }
  },

  // Obtener pagos de un proveedor
  getPayments: async (req, res) => {
    try {
      const { supplierId } = req.params;

      const supplier = await Supplier.findOne({
        _id: supplierId,
        userId: req.user._id,
      });

      if (!supplier) {
        return res.status(404).json({
          ok: false,
          message: "Proveedor no encontrado",
        });
      }

      res.json({
        ok: true,
        payments: supplier.documents.payments || [],
      });
    } catch (error) {
      console.error("Error al obtener pagos:", error);
      res.status(500).json({
        ok: false,
        message: "Error al obtener los pagos",
        error: error.message,
      });
    }
  },

  // Crear pago a proveedor
  createPayment: async (req, res) => {
    try {
      const { id } = req.params;
      const { date, paymentMethod, amount, invoices } = req.body;

      // Validar datos requeridos
      if (!date || !paymentMethod || !amount || !invoices?.length) {
        return res.status(400).json({
          ok: false,
          message: "Faltan datos requeridos para crear el pago",
        });
      }

      // Buscar proveedor
      const supplier = await Supplier.findOne({
        _id: id,
        userId: req.user._id.toString(),
      });

      if (!supplier) {
        return res.status(404).json({
          ok: false,
          message: "Proveedor no encontrado",
        });
      }

      // Validar facturas y montos
      let totalPagado = 0;
      const facturasAActualizar = [];

      for (const item of invoices) {
        const invoice = supplier.documents.invoices.id(item._id.toString());
        if (!invoice) {
          return res.status(400).json({
            ok: false,
            message: `Factura no encontrada: ${item._id}`,
          });
        }
        if (invoice.paymentStatus === "PAGADO") {
          return res.status(400).json({
            ok: false,
            message: `La factura ${invoice.invoiceNumber} ya está pagada`,
          });
        }
        totalPagado += item.amount;
        facturasAActualizar.push({
          id: item._id,
          amount: item.amount,
          total: invoice.total,
        });
      }

      if (totalPagado !== amount) {
        return res.status(400).json({
          ok: false,
          message: "La suma de los pagos no coincide con el monto total",
        });
      }

      // Generar número de pago
      const paymentNumber = await generatePaymentNumber();

      // Manejar el pago según el método
      if (paymentMethod === "EFECTIVO") {
        // Verificar saldo en caja
        const cash = await Cash.findOne({ user: req.user._id.toString() });
        if (!cash || cash.balance < amount) {
          return res.status(400).json({
            ok: false,
            message: "No hay suficiente efectivo en caja",
          });
        }

        // Actualizar la caja (EGRESO para pagos a proveedores)
        await Cash.findOneAndUpdate(
          { user: req.user._id },
          {
            $inc: { balance: -amount },
            $push: {
              transactions: {
                type: "EGRESO",
                amount: amount,
                description: `Pago a proveedor: ${supplier.fantasyName} ${supplier._id}`,
                category: "PAGO_PROVEEDOR",
                relatedDocument: {
                  type: "FACTURA",
                  documentId: invoices[0]._id,
                },
                date: new Date(date),
              },
            },
          }
        );
      } else if (
        ["TRANSFERENCIA", "CHEQUE", "TARJETA"].includes(paymentMethod)
      ) {
        // Verificar saldo en banco
        const bank = await Bank.findOne({ user: req.user._id.toString() });
        if (!bank || bank.balance < amount) {
          return res.status(400).json({
            ok: false,
            message: "No hay suficiente saldo en la cuenta bancaria",
          });
        }

        // Actualizar el banco
        await Bank.findOneAndUpdate(
          { user: req.user._id },
          {
            $inc: { balance: -amount },
            $push: {
              transactions: {
                type: "EGRESO",
                amount: amount,
                description: `Pago a proveedor: ${supplier.fantasyName} ${supplier._id} - ${paymentMethod}`,
                category: "PAGO_PROVEEDOR",
                relatedDocument: {
                  type: "FACTURA",
                  documentId: invoices[0]._id,
                },
                reference: req.body.reference || paymentNumber,
                date: new Date(date),
              },
            },
          }
        );
      }

      // Crear el nuevo pago
      const newPayment = {
        paymentNumber,
        date: new Date(date),
        paymentMethod,
        amount,
        reference: req.body.reference || "",
        observation: req.body.observation || "",
        invoices: invoices.map((inv) => ({
          invoice: inv._id,
          amount: inv.amount,
        })),
        createdBy: req.user._id,
        createdAt: new Date(),
      };

      // Actualizar proveedor y estado de facturas
      const updatedSupplier = await Supplier.findOneAndUpdate(
        { _id: id },
        {
          $push: { "documents.payments": newPayment },
          $inc: { "balance.current": -amount },
          $set: {
            "balance.lastUpdate": new Date(),
            ...facturasAActualizar.reduce((acc, factura) => {
              const newStatus =
                factura.amount >= factura.total ? "PAGADO" : "PARCIAL";
              acc[`documents.invoices.$[f${factura.id}].paymentStatus`] =
                newStatus;
              return acc;
            }, {}),
          },
        },
        {
          new: true,
          arrayFilters: facturasAActualizar.map((factura) => ({
            [`f${factura.id}._id`]: factura.id,
          })),
        }
      );

      res.json({
        ok: true,
        message: "Pago registrado exitosamente",
        payment: newPayment,
        supplier: updatedSupplier,
      });
    } catch (error) {
      console.error("Error al crear pago:", error);
      res.status(500).json({
        ok: false,
        message: "Error al registrar el pago",
        error: error.message,
      });
    }
  },
};

// Función para generar número de pago
const generatePaymentNumber = async () => {
  const lastPayment = await Supplier.findOne({})
    .sort({ "documents.payments.paymentNumber": -1 })
    .select("documents.payments.paymentNumber");

  let lastNumber = 0;
  if (lastPayment && lastPayment.documents?.payments?.length > 0) {
    const lastPaymentNumber = lastPayment.documents.payments[0].paymentNumber;
    lastNumber = parseInt(lastPaymentNumber.replace("PAY-", ""));
  }

  const newNumber = lastNumber + 1;
  return `PAY-${newNumber.toString().padStart(6, "0")}`;
};

export default supplierController;
