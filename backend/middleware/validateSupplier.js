import { check } from "express-validator";
import { validateResults } from "../helpers/validateHelper.js";

export const validateSupplier = [
  check("businessName")
    .exists()
    .notEmpty()
    .withMessage("La razón social es obligatoria")
    .isLength({ max: 100 })
    .withMessage("La razón social no puede exceder los 100 caracteres"),

  check("cuit")
    .exists()
    .notEmpty()
    .withMessage("El CUIT es obligatorio")
    .matches(/^\d{2}-\d{8}-\d{1}$/)
    .withMessage("El formato del CUIT debe ser XX-XXXXXXXX-X"),

  check("taxCondition")
    .exists()
    .notEmpty()
    .withMessage("La condición fiscal es obligatoria")
    .isIn([
      "RESPONSABLE_INSCRIPTO",
      "MONOTRIBUTO",
      "EXENTO",
      "CONSUMIDOR_FINAL",
    ])
    .withMessage("Condición fiscal inválida"),

  check("contact.email").optional().isEmail().withMessage("Email inválido"),

  check("address")
    .optional()
    .isObject()
    .withMessage("La dirección debe ser un objeto válido"),

  (req, res, next) => {
    validateResults(req, res, next);
  },
];
