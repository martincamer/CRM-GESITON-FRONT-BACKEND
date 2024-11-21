import express from "express";
import {
  getCash,
  createCashTransaction,
  transferCashBank,
  initializeCash,
} from "../controllers/cash.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getCash);

router.route("/transaction").post(protect, createCashTransaction);

router.route("/transfer").post(protect, transferCashBank);

router.route("/initialize").post(protect, initializeCash);

export default router;
