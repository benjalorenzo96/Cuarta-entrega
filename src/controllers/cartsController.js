import Cart from '../dao/models/cartsModel.js';
import Ticket from '../dao/models/ticketModel.js';

const cartsController = {
  // ... (otros métodos)

  purchaseCart: async (req, res) => {
    const cartId = req.params.cid;

    try {
      const cart = await Cart.findById(cartId).populate('products.product');

      if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
      }

      const productsToPurchase = [];
      const productsNotPurchased = [];

      for (const cartProduct of cart.products) {
        const { product, quantity } = cartProduct;
        const availableStock = product.stock;

        if (quantity <= availableStock) {
          product.stock -= quantity;
          await product.save();

          productsToPurchase.push({ product, quantity });
        } else {
          productsNotPurchased.push(product._id);
        }
      }

      const purchaseDatetime = new Date();
      const amount = productsToPurchase.reduce((total, cartProduct) => {
        return total + cartProduct.product.price * cartProduct.quantity;
      }, 0);

      const ticket = new Ticket({
        code: generateUniqueCode(),
        purchase_datetime: purchaseDatetime,
        amount: amount,
        purchaser: req.user.email,
        products: productsToPurchase,
      });

      await ticket.save();

      cart.products = cart.products.filter(
        (cartProduct) => !productsNotPurchased.includes(cartProduct.product._id)
      );
      await cart.save();

      res.status(200).json({ message: 'Compra completada', productsNotPurchased });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al procesar la compra del carrito' });
    }
  },

  // ... (otros métodos)
};

function generateUniqueCode() {
  return Math.random().toString(36).substr(2, 9);
}

export default cartsController;
