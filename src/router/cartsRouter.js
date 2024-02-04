import express from 'express';
import { cartsController } from '../controllers/cartsController.js';

const cartsRouter = express.Router();

// GET /api/carts/:cid para obtener un carrito específico
cartsRouter.get('/:cid', cartsController.getCartById);

// DELETE /api/carts/:cid/products/:pid para eliminar un producto del carrito
cartsRouter.delete('/:cid/products/:pid', cartsController.deleteProductFromCart);

// PUT /api/carts/:cid para actualizar el carrito con un arreglo de productos
cartsRouter.put('/:cid', cartsController.updateCart);

// PUT /api/carts/:cid/products/:pid para actualizar la cantidad de ejemplares del producto en el carrito
cartsRouter.put('/:cid/products/:pid', cartsController.updateProductQuantity);

// DELETE /api/carts/:cid para eliminar todos los productos del carrito
cartsRouter.delete('/:cid', cartsController.deleteCart);

// POST /api/carts/:cid/purchase para finalizar el proceso de compra del carrito
cartsRouter.post('/:cid/purchase', cartsController.purchaseCart);

// POST /api/carts/:pid/add para agregar un producto al carrito
cartsRouter.put('/:pid/add', cartsController.addToCart);


export default cartsRouter;




