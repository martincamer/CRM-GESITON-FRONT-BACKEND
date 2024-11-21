import { connectDB } from "./config/db.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/product.routes.js";
import supplierRoutes from "./routes/supplier.routes.js";
import cashRoutes from "./routes/cash.routes.js";
import bankRoutes from "./routes/bank.routes.js";
import clientRoutes from "./routes/client.routes.js";

// Configuraciones
dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

// Conectar a MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Algo salió mal!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "¡API funcionando!" });
});

// Rutas
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/cash", cashRoutes);
app.use("/api/bank", bankRoutes);
app.use("/api/clients", clientRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
