// routes/productsRouter.js
import express from 'express';
import productsController from '../controllers/productsController.js';
import { authorizeAdmin } from '../middleware/authorizationMiddleware.js'; // Importar el middleware

const productsRouter = express.Router();

// GET /api/products
productsRouter.get('/', productsController.getProducts);

// POST /api/products (Solo accesible para el administrador)
productsRouter.post('/', authorizeAdmin, productsController.createProduct);

// PUT /api/products/:id (Solo accesible para el administrador)
productsRouter.put('/:id', authorizeAdmin, productsController.updateProduct);

// DELETE /api/products/:id (Solo accesible para el administrador)
productsRouter.delete('/:id', authorizeAdmin, productsController.deleteProduct);

// Ruta para crear un nuevo producto
productsRouter.post('/', productsController.createProduct);

export default productsRouter;


