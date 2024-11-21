import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "El nombre del producto es obligatorio"],
      trim: true,
      maxLength: [100, "El nombre no puede exceder los 100 caracteres"],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [500, "La descripción no puede exceder los 500 caracteres"],
    },
    type: {
      type: String,
      required: [true, "El tipo de uso es obligatorio"],
      enum: {
        values: ["VENTA", "COMPRA", "AMBOS"],
        message: "{VALUE} no es un tipo válido",
      },
    },
    unit: {
      type: String,
      required: [true, "La unidad de medida es obligatoria"],
      enum: {
        values: [
          "UNIDAD",
          "METRO",
          "METRO_CUADRADO",
          "METRO_CUBICO",
          "MATERIA_PRIMA",
          "PRODUCTO_TERMINADO",
          "INSUMO",
          "HERRAMIENTA",
          "KILOGRAMO",
          "GRAMO",
          "LITRO",
          "MILILITRO",
          "HORA",
          "DIA",
          "KILOMETRO",
          "PIEZA",
          "PAQUETE",
          "CAJA",
          "DOCENA",
        ],
        message: "{VALUE} no es una unidad válida",
      },
    },
    price: {
      type: Number,
      required: [true, "El precio es obligatorio"],
      min: [0, "El precio no puede ser negativo"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índices
ProductSchema.index({ name: 1, userId: 1 }, { unique: true });
ProductSchema.index({ isActive: 1 });

export default mongoose.model("Product", ProductSchema);
