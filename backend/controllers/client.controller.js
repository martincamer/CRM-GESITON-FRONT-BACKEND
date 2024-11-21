import Client from "../models/Client.js";
import Cash from "../models/Cash.js";
import Bank from "../models/Bank.js";
import mongoose from "mongoose";
import PDFDocument from "pdfkit";

// Obtener todos los clientes
const getClients = async (req, res) => {
  try {
    const clients = await Client.find({ userId: req.user.id }).sort({
      businessName: 1,
    });

    res.json({
      ok: true,
      clients,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Error al obtener los clientes",
    });
  }
};

// Obtener un cliente específico con sus documentos
const getClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!client) {
      return res.status(404).json({
        ok: false,
        message: "Cliente no encontrado",
      });
    }

    res.json({
      ok: true,
      client,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Error al obtener el cliente",
    });
  }
};

// Crear nuevo cliente
const createClient = async (req, res) => {
  try {
    // Verificar si ya existe un cliente con el mismo documento
    const existingClient = await Client.findOne({
      documentNumber: req.body.documentNumber,
      userId: req.user.id,
    });

    if (existingClient) {
      return res.status(400).json({
        ok: false,
        message: "Ya existe un cliente con ese número de documento",
      });
    }

    const client = new Client(req.body);
    client.userId = req.user.id;

    await client.save();

    res.json({
      ok: true,
      message: "Cliente creado exitosamente",
      client,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Error al crear el cliente",
    });
  }
};

// Actualizar cliente
const updateClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!client) {
      return res.status(404).json({
        ok: false,
        message: "Cliente no encontrado",
      });
    }

    // Actualizar campos
    Object.keys(req.body).forEach((key) => {
      client[key] = req.body[key];
    });

    await client.save();

    res.json({
      ok: true,
      message: "Cliente actualizado exitosamente",
      client,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Error al actualizar el cliente",
    });
  }
};

// Eliminar cliente
const deleteClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!client) {
      return res.status(404).json({
        ok: false,
        message: "Cliente no encontrado",
      });
    }

    client.isActive = false;
    await client.save();

    res.json({
      ok: true,
      message: "Cliente eliminado exitosamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Error al eliminar el cliente",
    });
  }
};

// // Crear factura
// const createInvoice = async (req, res) => {
//   try {
//     const client = await Client.findOne({
//       _id: req.params.id,
//       userId: req.user.id,
//     });

//     if (!client) {
//       return res.status(404).json({
//         ok: false,
//         message: "Cliente no encontrado",
//       });
//     }

//     // Verificar límite de crédito
//     if (!client.canCreateInvoice(req.body.total)) {
//       return res.status(400).json({
//         ok: false,
//         message: "El cliente ha superado su límite de crédito",
//       });
//     }

//     client.documents.invoices.push(req.body);
//     await client.save();

//     res.json({
//       ok: true,
//       message: "Factura creada exitosamente",
//       client,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       ok: false,
//       message: "Error al crear la factura",
//     });
//   }
// };

const createInvoice = async (req, res) => {
  try {
    // Validar datos requeridos
    const { invoiceType, date, items, total } = req.body;
    if (!invoiceType || !date || !items || !total) {
      return res.status(400).json({
        ok: false,
        message: "Faltan datos requeridos para crear la factura",
      });
    }

    // Buscar cliente
    const client = await Client.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!client) {
      return res.status(404).json({
        ok: false,
        message: "Cliente no encontrado",
      });
    }

    // Verificar límite de crédito
    if (!client.canCreateInvoice(total)) {
      return res.status(400).json({
        ok: false,
        message: "El cliente ha superado su límite de crédito",
      });
    }

    // Validar productos
    const Product = mongoose.model("Product");
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({
          ok: false,
          message: `Producto no encontrado: ${item.product}`,
        });
      }
    }

    // Generar número de factura
    const lastInvoice = await Client.findOne(
      { "documents.invoices": { $exists: true, $ne: [] } },
      { "documents.invoices": { $slice: -1 } }
    ).sort({ "documents.invoices.invoiceNumber": -1 });

    let nextNumber;
    if (lastInvoice?.documents?.invoices?.[0]?.invoiceNumber) {
      nextNumber =
        parseInt(lastInvoice.documents.invoices[0].invoiceNumber) + 1;
    } else {
      nextNumber = 1000; // Número base
    }

    const invoiceNumber = nextNumber.toString().padStart(6, "0");

    // Crear la nueva factura
    const newInvoice = {
      ...req.body,
      invoiceNumber,
      date: new Date(date),
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
      status: "PENDIENTE",
      paymentStatus: "PENDIENTE",
      createdAt: new Date(),
      createdBy: req.user.id,
    };

    // Actualizar cliente usando findOneAndUpdate para evitar problemas de concurrencia
    const updatedClient = await Client.findOneAndUpdate(
      { _id: req.params.id },
      {
        $push: { "documents.invoices": newInvoice },
        $inc: { "balance.current": total },
        $set: { "balance.lastUpdate": new Date() },
      },
      { new: true, runValidators: true }
    );

    if (!updatedClient) {
      return res.status(400).json({
        ok: false,
        message: "Error al actualizar el cliente",
      });
    }

    // Respuesta exitosa
    res.json({
      ok: true,
      message: "Factura creada exitosamente",
      invoice: updatedClient,
    });
  } catch (error) {
    console.error("Error detallado:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    res.status(500).json({
      ok: false,
      message: "Error al crear la factura",
      error: error.message, // Solo en desarrollo
    });
  }
};

// Crear presupuesto
const createQuote = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!client) {
      return res.status(404).json({
        ok: false,
        message: "Cliente no encontrado",
      });
    }

    // Generar número de presupuesto
    const lastQuote = await Client.findOne(
      { "documents.quotes": { $exists: true, $ne: [] } },
      { "documents.quotes": { $slice: -1 } }
    ).sort({ "documents.quotes.quoteNumber": -1 });

    let nextNumber = 1000;
    if (lastQuote?.documents?.quotes?.[0]?.quoteNumber) {
      nextNumber = parseInt(lastQuote.documents.quotes[0].quoteNumber) + 1;
    }

    // Crear el nuevo presupuesto
    const newQuote = {
      ...req.body,
      quoteNumber: nextNumber.toString(),
      status: "PENDIENTE",
      createdAt: new Date(),
      createdBy: req.user.id,
    };

    // Actualizar cliente con el nuevo presupuesto
    const updatedClient = await Client.findOneAndUpdate(
      { _id: req.params.id },
      {
        $push: {
          "documents.quotes": newQuote,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedClient) {
      return res.status(400).json({
        ok: false,
        message: "Error al actualizar el cliente",
      });
    }

    res.json({
      ok: true,
      message: "Presupuesto creado exitosamente",
      quote: newQuote,
      clienteActualizado: updatedClient,
    });
  } catch (error) {
    console.error("Error al crear presupuesto:", error);
    res.status(500).json({
      ok: false,
      message: "Error al crear el presupuesto",
    });
  }
};

// Crear pago
const createPayment = async (req, res) => {
  try {
    // Validar datos requeridos
    const { date, paymentMethod, amount, invoices } = req.body;
    if (!date || !paymentMethod || !amount || !invoices?.length) {
      return res.status(400).json({
        ok: false,
        message: "Faltan datos requeridos para crear el pago",
      });
    }

    // Buscar y actualizar cliente en una sola operación atómica
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {},
      { new: true }
    );

    if (!client) {
      return res.status(404).json({
        ok: false,
        message: "Cliente no encontrado",
      });
    }

    // Validar facturas y montos
    let totalPagado = 0;
    const facturasAActualizar = [];

    for (const item of invoices) {
      const invoice = client.documents.invoices.id(item.invoice);
      if (!invoice) {
        return res.status(400).json({
          ok: false,
          message: `Factura no encontrada: ${item.invoice}`,
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
        id: item.invoice,
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
    const lastPayment = await Client.findOne(
      { "documents.payments": { $exists: true, $ne: [] } },
      { "documents.payments": { $slice: -1 } }
    ).sort({ "documents.payments.paymentNumber": -1 });

    let nextNumber = 1000;
    if (lastPayment?.documents?.payments?.[0]?.paymentNumber) {
      nextNumber =
        parseInt(lastPayment.documents.payments[0].paymentNumber) + 1;
    }

    const paymentNumber = nextNumber.toString().padStart(6, "0");

    // Manejar el pago según el método
    if (paymentMethod === "EFECTIVO") {
      // Actualizar la caja
      const updatedCash = await Cash.findOneAndUpdate(
        { user: req.user.id },
        {
          $inc: { balance: amount },
          $push: {
            transactions: {
              type: "INGRESO",
              amount: amount,
              description: `Pago recibido - Cliente: ${client.businessName}`,
              category: "VENTA",
              relatedDocument: {
                type: "FACTURA",
                documentId: invoices[0].invoice,
              },
              date: new Date(date),
            },
          },
          $set: { lastUpdated: new Date() },
        },
        { new: true }
      );

      if (!updatedCash) {
        const newCash = new Cash({
          user: req.user.id,
          balance: amount,
          transactions: [
            {
              type: "INGRESO",
              amount: amount,
              description: `Pago recibido - Cliente: ${client.businessName}`,
              category: "VENTA",
              relatedDocument: {
                type: "FACTURA",
                documentId: invoices[0].invoice,
              },
              date: new Date(date),
            },
          ],
        });
        await newCash.save();
      }
    } else if (["TRANSFERENCIA", "CHEQUE", "TARJETA"].includes(paymentMethod)) {
      // Actualizar el banco
      const updatedBank = await Bank.findOneAndUpdate(
        { user: req.user.id },
        {
          $inc: { balance: amount },
          $push: {
            transactions: {
              type: "INGRESO",
              amount: amount,
              description: `Pago recibido - Cliente: ${client.businessName} - Método: ${paymentMethod}`,
              category: "COBRO_CLIENTE",
              relatedDocument: {
                type: "FACTURA",
                documentId: invoices[0].invoice,
              },
              transactionNumber: req.body.reference || paymentNumber, // Usar referencia si existe
              date: new Date(date),
            },
          },
          $set: { lastUpdated: new Date() },
        },
        { new: true }
      );

      if (!updatedBank) {
        return res.status(400).json({
          ok: false,
          message: "No se encontró una cuenta bancaria configurada",
        });
      }
    }

    // Crear el nuevo pago
    const newPayment = {
      ...req.body,
      paymentNumber,
      date: new Date(date),
      status: "PENDIENTE",
      createdAt: new Date(),
      createdBy: req.user.id,
    };

    // Actualizar cliente, balance y estado de facturas en una sola operación
    const updatedClient = await Client.findOneAndUpdate(
      { _id: req.params.id },
      {
        $push: { "documents.payments": newPayment },
        $inc: { "balance.current": -amount },
        $set: {
          "balance.lastUpdate": new Date(),
          ...facturasAActualizar.reduce((acc, factura) => {
            const totalPagadoFactura = amount; // Aquí deberías calcular el total pagado para esta factura específica
            const newStatus =
              totalPagadoFactura >= factura.total ? "PAGADO" : "PARCIAL";
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

    if (!updatedClient) {
      return res.status(400).json({
        ok: false,
        message: "Error al actualizar el cliente",
      });
    }

    // Obtener la cuenta actualizada según el método de pago
    let cuentaActualizada = null;
    if (paymentMethod === "EFECTIVO") {
      cuentaActualizada = await Cash.findOne({ user: req.user.id });
    } else if (["TRANSFERENCIA", "CHEQUE", "TARJETA"].includes(paymentMethod)) {
      cuentaActualizada = await Bank.findOne({ user: req.user.id });
    }

    res.json({
      ok: true,
      message: "Pago registrado exitosamente",
      payment: newPayment,
      clienteActualizado: updatedClient,
      cuentaActualizada,
    });
  } catch (error) {
    console.error("Error detallado:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    res.status(500).json({
      ok: false,
      message: "Error al registrar el pago",
      error: error.message,
    });
  }
};

// Convertir presupuesto a factura
const convertQuoteToInvoice = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!client) {
      return res.status(404).json({
        ok: false,
        message: "Cliente no encontrado",
      });
    }

    const quote = client.documents.quotes.id(req.params.quoteId);
    if (!quote) {
      return res.status(404).json({
        ok: false,
        message: "Presupuesto no encontrado",
      });
    }

    // Crear factura basada en el presupuesto
    const invoice = {
      ...quote.toObject(),
      invoiceNumber: req.body.invoiceNumber,
      invoiceType: req.body.invoiceType,
      date: new Date(),
      paymentStatus: "PENDIENTE",
    };

    delete invoice._id;
    delete invoice.quoteNumber;
    delete invoice.validUntil;
    delete invoice.status;

    // Verificar límite de crédito
    if (!client.canCreateInvoice(invoice.total)) {
      return res.status(400).json({
        ok: false,
        message: "El cliente ha superado su límite de crédito",
      });
    }

    client.documents.invoices.push(invoice);
    quote.status = "FACTURADO";
    quote.convertedToInvoice =
      client.documents.invoices[client.documents.invoices.length - 1]._id;

    await client.save();

    res.json({
      ok: true,
      message: "Presupuesto convertido a factura exitosamente",
      client,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Error al convertir el presupuesto a factura",
    });
  }
};

const generateInvoicePDF = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.clientId,
      "documents.invoices._id": req.params.invoiceId,
    });

    if (!client) {
      return res
        .status(404)
        .json({ message: "Cliente o factura no encontrada" });
    }

    const invoice = client.documents.invoices.id(req.params.invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: "Factura no encontrada" });
    }

    // Función auxiliar para formatear números
    const formatNumber = (number) => {
      if (number === undefined || number === null) return "0";
      return number.toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=factura-${invoice.invoiceNumber}.pdf`
    );

    doc.pipe(res);

    try {
      // Encabezado
      doc
        .fontSize(20)
        .text("FACTURA", { align: "center" })
        .moveDown()
        .fontSize(12);

      // Información de la factura
      doc
        .text(`Factura #: ${invoice.invoiceNumber || "N/A"}`)
        .text(`Fecha: ${new Date(invoice.date).toLocaleDateString("es-AR")}`)
        .text(
          `Vencimiento: ${new Date(invoice.dueDate).toLocaleDateString(
            "es-AR"
          )}`
        )
        .moveDown();

      // Información del cliente
      doc
        .text("CLIENTE")
        .text(`Nombre: ${client.name || "N/A"}`)
        .text(`Email: ${client.email || "N/A"}`)
        .text(`Teléfono: ${client.phone || "N/A"}`)
        .moveDown();

      // Tabla de items
      let y = doc.y + 20;
      const itemsHeader = [
        "Descripción",
        "Cantidad",
        "Precio",
        "Descuento",
        "Subtotal",
      ];
      const colWidths = [200, 70, 100, 70, 100];

      let x = 50;
      itemsHeader.forEach((header, i) => {
        doc.text(header, x, y, { width: colWidths[i], align: "left" });
        x += colWidths[i];
      });

      // Items
      y += 20;
      invoice.items.forEach((item) => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }

        x = 50;
        doc.text(item.description || "N/A", x, y, { width: colWidths[0] });
        x += colWidths[0];
        doc.text(String(item.quantity || 0), x, y, { width: colWidths[1] });
        x += colWidths[1];
        doc.text(`$${formatNumber(item.unitPrice)}`, x, y, {
          width: colWidths[2],
        });
        x += colWidths[2];
        doc.text(`${item.discount || 0}%`, x, y, { width: colWidths[3] });
        x += colWidths[3];
        doc.text(`$${formatNumber(item.subtotal)}`, x, y, {
          width: colWidths[4],
        });

        y += 20;
      });

      // Total
      doc
        .moveDown()
        .fontSize(14)
        .text(`Total: $${formatNumber(invoice.total)}`, { align: "right" });

      // Observaciones
      if (invoice.observation) {
        doc
          .moveDown()
          .fontSize(12)
          .text("Observaciones:")
          .text(invoice.observation);
      }

      doc.end();
    } catch (error) {
      console.error("Error generando contenido del PDF:", error);
      doc.end();
    }
  } catch (error) {
    console.error("Error general:", error);
    if (!res.headersSent) {
      res.status(500).json({
        message: "Error generando el PDF",
        error: error.message,
      });
    }
  }
};

const obtenerFacturasCliente = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("ID recibido:", id);

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        msg: "ID de cliente inválido",
        details: "El ID debe ser un ObjectId válido de MongoDB",
      });
    }

    const cliente = await Client.findById(id).select("documents.invoices");
    console.log("Búsqueda de cliente completada");

    if (!cliente) {
      console.log("Cliente no encontrado para ID:", id);
      return res.status(404).json({
        msg: "Cliente no encontrado",
        details: `No se encontró cliente con ID: ${id}`,
      });
    }

    console.log("Cliente encontrado:", {
      id: cliente._id,
      tieneDocuments: !!cliente.documents,
      tieneFacturas: !!(cliente.documents && cliente.documents.invoices),
      cantidadFacturas: cliente.documents?.invoices?.length || 0,
    });

    // Asegurarse de que documents e invoices existan
    if (!cliente.documents || !cliente.documents.invoices) {
      console.log("No hay documentos o facturas");
      return res.json([]); // Retornar array vacío si no hay facturas
    }

    const facturas = cliente.documents.invoices;
    console.log(`Procesando ${facturas.length} facturas`);

    const facturasOrdenadas = [...facturas].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    const facturasFormateadas = facturasOrdenadas.map((factura) => ({
      _id: factura._id,
      invoiceNumber: factura.invoiceNumber || "",
      invoiceType: factura.invoiceType || "",
      date: factura.date || new Date(),
      dueDate: factura.dueDate,
      items: Array.isArray(factura.items)
        ? factura.items.map((item) => ({
            description: item.description || "",
            quantity: Number(item.quantity) || 0,
            unitPrice: Number(item.unitPrice) || 0,
            discount: Number(item.discount) || 0,
            subtotal: Number(item.subtotal) || 0,
          }))
        : [],
      total: Number(factura.total) || 0,
      paymentStatus: factura.paymentStatus || "PENDIENTE",
      observation: factura.observation || "",
    }));

    console.log("Facturas formateadas correctamente");
    return res.json(facturasFormateadas);
  } catch (error) {
    console.error("Error en obtenerFacturasCliente:", {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      msg: "Error al obtener las facturas",
      details: error.message,
      type: error.name,
    });
  }
};

const createNote = async (req, res) => {
  try {
    const { id } = req.params;
    const noteData = req.body;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({
        ok: false,
        message: "Cliente no encontrado",
      });
    }

    // Generar número de nota
    const lastNote =
      client.documents.creditDebitNotes &&
      client.documents.creditDebitNotes.length > 0
        ? client.documents.creditDebitNotes[
            client.documents.creditDebitNotes.length - 1
          ]
        : null;

    let nextNumber = "00001";
    if (lastNote) {
      const lastNumber = parseInt(lastNote.noteNumber.slice(-5));
      nextNumber = String(lastNumber + 1).padStart(5, "0");
    }

    // Validar factura relacionada
    const relatedInvoice = client.documents.invoices.find(
      (inv) => inv._id.toString() === noteData.relatedInvoice
    );

    if (!relatedInvoice) {
      return res.status(400).json({
        ok: false,
        message: "Factura relacionada no encontrada",
      });
    }

    // Crear la nota con número generado
    const newNote = {
      ...noteData,
      noteNumber: nextNumber,
      status: "PENDIENTE",
      createdBy: req.user.id,
      createdAt: new Date(),
    };

    // Agregar la nota al array de notas del cliente
    if (!client.documents.creditDebitNotes) {
      client.documents.creditDebitNotes = [];
    }

    client.documents.creditDebitNotes.push(newNote);

    // Desactivar el middleware temporalmente para evitar el guardado paralelo
    client.$__.saveOptions = { ...client.$__.saveOptions, timestamps: false };
    client.markModified("documents.creditDebitNotes");

    // Guardar los cambios
    await client.save();

    // Actualizar el balance en una operación separada
    await Client.findByIdAndUpdate(
      id,
      { $set: { "balance.lastUpdate": new Date() } },
      { new: true }
    );

    res.json({
      ok: true,
      message: "Nota creada exitosamente",
      note: newNote,
    });
  } catch (error) {
    console.error("Error al crear nota:", error);
    res.status(500).json({
      ok: false,
      message: "Error al crear la nota",
      error: error.message,
    });
  }
};

export {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  createInvoice,
  createQuote,
  createPayment,
  convertQuoteToInvoice,
  generateInvoicePDF,
  obtenerFacturasCliente,
  createNote,
};
