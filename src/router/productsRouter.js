import express from 'express';
import productsController from '../controllers/productsController.js';

const productsRouter = express.Router();

// GET /api/products
productsRouter.get('/', productsController.getProducts);

export default productsRouter;

