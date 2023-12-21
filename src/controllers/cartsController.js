import Cart from '../dao/models/cartsModel.js';
import Ticket from '../dao/models/ticketModel.js';
/**
 * Realiza la compra del carrito.
 * @route POST /api/carts/:cid/purchase
 * @group Carrito - Operaciones relacionadas con carritos
 * @param {string} cid.path.required - ID del carrito.
 * @returns {object} 200 - Resultado de la compra.
 * @throws {404} - Carrito no encontrado.
 * @throws {500} - Error al procesar la compra del carrito.
 * @description Realiza la compra de los productos en el carrito.
 */
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
  addToCart: async (req, res) => {
    const productId = req.params.pid;
    const quantity = parseInt(req.body.quantity);

    try {
      const product = await ProductDAO.getProductById(productId);

      // Verificar si el producto pertenece al usuario actual
      if (req.user.role === 'premium' && product.owner === req.user.email) {
        return res.status(403).json({ error: 'No puedes agregar a tu carrito un producto que te pertenece' });
      }

      // Lógica para agregar el producto al carrito
      // ... (código existente)
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al agregar el producto al carrito' });
    }
  },

  purchaseCart: async (req, res) => {
    const cartId = req.params.cid;

    try {
      const cart = await Cart.findById(cartId).populate('products.product');

      if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
      }

      // Verificar si algún producto del carrito pertenece al usuario actual
      const productsBelongingToUser = cart.products.some((cartProduct) => cartProduct.product.owner === req.user.email);
      if (req.user.role === 'premium' && productsBelongingToUser) {
        return res.status(403).json({ error: 'No puedes comprar un carrito que contiene productos que te pertenecen' });
      }

      // Lógica para procesar la compra del carrito
      // ... (código existente)
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
