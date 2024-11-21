import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getBank,
  createBankTransaction,
  initializeBank,
} from "../controllers/bank.controller.js";

const router = express.Router();

router.route("/").get(protect, getBank);

router.route("/transaction").post(protect, createBankTransaction);

router.route("/initialize").post(protect, initializeBank);

export default router;
