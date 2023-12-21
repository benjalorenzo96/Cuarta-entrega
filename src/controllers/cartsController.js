import Cart from '../dao/models/cartsModel.js';
import Ticket from '../dao/models/ticketModel.js';
import ProductDAO from '../dao/productDAO.js';
import { processCart, generateUniqueCode } from '../services/cartService.js';

const cartsController = {
  purchaseCart: async (req, res) => {
    const cartId = req.params.cid;

    try {
      const { productsToPurchase, productsNotPurchased } = await processCart(cartId, req.user.email);

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

      // Verificar si algún producto del carrito pertenece al usuario actual
      const productsBelongingToUser = await checkProductsBelongingToUser(cartId, req.user.email);
      if (req.user.role === 'premium' && productsBelongingToUser) {
        return res.status(403).json({ error: 'No puedes comprar un carrito que contiene productos que te pertenecen' });
      }

      await removeProductsFromCart(cartId, productsNotPurchased);

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

      // Verificar si hay suficiente stock
      if (quantity > product.stock) {
        return res.status(400).json({ error: 'No hay suficiente stock disponible para agregar la cantidad solicitada' });
      }

      await updateCart(req.user.cartId, productId, quantity);

      res.status(200).json({ message: 'Producto agregado al carrito exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al agregar el producto al carrito' });
    }
  },
}

export default cartsController;
