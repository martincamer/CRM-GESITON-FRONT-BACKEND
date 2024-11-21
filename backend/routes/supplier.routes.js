import express from "express";
import supplierController from "../controllers/supplier.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(protect);

// Rutas básicas de proveedores
router.post("/", supplierController.createSupplier);
router.get("/", supplierController.getSuppliers);
router.get("/:id", supplierController.getSupplierById);
router.put("/:id", supplierController.updateSupplier);

// Rutas para documentos
router.post("/:supplierId/invoices", supplierController.addInvoice);
router.post(
  "/:supplierId/purchase-orders",
  supplierController.addPurchaseOrder
);

router.post("/:id/payments", supplierController.createPayment);

export default router;
