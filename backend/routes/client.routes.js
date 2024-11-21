import express from "express";
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  createInvoice,
  createQuote,
  convertQuoteToInvoice,
  createPayment,
  generateInvoicePDF,
  obtenerFacturasCliente,
  createNote,
} from "../controllers/client.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rutas protegidas
router.route("/").get(protect, getClients).post(protect, createClient);

router
  .route("/:id")
  .get(protect, getClient)
  .put(protect, updateClient)
  .delete(protect, deleteClient);

// Rutas para documentos
router.post("/:id/invoices", protect, createInvoice);
router.post("/:id/quotes", protect, createQuote);
router.post("/:id/notes", protect, createNote);
router.post(
  "/:clientId/quotes/:quoteId/convert",
  protect,
  convertQuoteToInvoice
);

router.post("/:id/payments", protect, createPayment);

router.get("/:clientId/invoices/:invoiceId/pdf", protect, generateInvoicePDF);

// Ruta para obtener facturas de un cliente
router.get("/:id/invoices", protect, obtenerFacturasCliente);

export default router;
