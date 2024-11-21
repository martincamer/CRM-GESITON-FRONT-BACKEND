import Product from "../models/Product.js";

const productController = {
  // Crear nuevo producto
  createProduct: async (req, res) => {
    try {
      const newProduct = new Product({
        ...req.body,
        userId: req.user._id,
      });

      const savedProduct = await newProduct.save();
      res.status(201).json({
        ok: true,
        product: savedProduct,
        message: "Producto creado exitosamente",
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          ok: false,
          message: "Ya tienes un producto registrado con este nombre",
          error: "DUPLICATE_NAME",
        });
      }
      res.status(500).json({
        ok: false,
        message: error.message,
      });
    }
  },

  // Obtener todos los productos del usuario
  getProducts: async (req, res) => {
    try {
      console.log(req.user._id);
      const filters = { userId: req.user._id.toString() };

      if (req.query.isActive) filters.isActive = req.query.isActive === "true";

      const products = await Product.find(filters).sort({ createdAt: -1 });

      res.status(200).json({
        ok: true,
        products,
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        message: error.message,
      });
    }
  },

  // Obtener un producto por ID
  getProduct: async (req, res) => {
    try {
      const product = await Product.findOne({
        _id: req.params.id,
        userId: req.user.id,
      });

      if (!product) {
        return res.status(404).json({
          ok: false,
          message: "Producto no encontrado",
        });
      }

      res.status(200).json({
        ok: true,
        product,
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        message: error.message,
      });
    }
  },

  // Actualizar producto
  updateProduct: async (req, res) => {
    try {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: req.params.id,
          userId: req.user.id,
        },
        { $set: req.body },
        { new: true }
      );

      if (!updatedProduct) {
        return res.status(404).json({
          ok: false,
          message: "Producto no encontrado",
        });
      }

      res.status(200).json({
        ok: true,
        product: updatedProduct,
        message: "Producto actualizado exitosamente",
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          ok: false,
          message: "Ya existe un producto con ese nombre",
        });
      }
      res.status(500).json({
        ok: false,
        message: error.message,
      });
    }
  },

  // Eliminar producto (soft delete)
  deleteProduct: async (req, res) => {
    try {
      const product = await Product.findOneAndUpdate(
        {
          _id: req.params.id,
          userId: req.user.id,
        },
        { isActive: false },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({
          ok: false,
          message: "Producto no encontrado",
        });
      }

      res.status(200).json({
        ok: true,
        message: "Producto eliminado exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        message: error.message,
      });
    }
  },
};

export default productController;
