// cartsModel.js
import mongoose from 'mongoose';

const cartProductSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Referencia al modelo Product
  },
  quantity: Number,
});

const cartSchema = new mongoose.Schema({
  products: [cartProductSchema],
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
