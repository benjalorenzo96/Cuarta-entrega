// models/cartsModel.js
import mongoose from 'mongoose';

/**
 * @typedef CartProduct
 * @property {string} product - ID del producto en el carrito.
 * @property {number} quantity - Cantidad del producto en el carrito.
 */

/**
 * @typedef Cart
 * @property {Array.<CartProduct>} products - Lista de productos en el carrito.
 * @property {string} user - ID del usuario al que pertenece el carrito.
 */

const cartSchema = new mongoose.Schema({
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      quantity: Number,
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;


