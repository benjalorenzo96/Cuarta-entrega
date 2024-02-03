import Cart from '../dao/models/cartsModel.js';
import Ticket from '../dao/models/ticketModel.js';
import ProductDAO from '../dao/productDAO.js';
import { processCart, generateUniqueCode } from '../services/cartService.js';

/**
 * Controlador para realizar la compra de un carrito.
 * @route POST /api/carts/:cid/purchase
 * @group Carritos - Operaciones relacionadas con carritos de compra
 * @param {string} cid.path.required - ID del carrito a comprar.
 * @returns {Object} 200 - Mensaje de éxito y productos no comprados.
 * @throws {403} - No puedes comprar un carrito con productos propios (solo para usuarios premium).
 * @throws {500} - Error al procesar la compra del carrito.
 * @description Realiza la compra de un carrito, genera un ticket y actualiza el estado del carrito.
 */
const cartsController = {
  purchaseCart: async (req, res) => {
    const cartId = req.params.cid;

    try {
      // Procesar el carrito y obtener productos comprados y no comprados
      const { productsToPurchase, productsNotPurchased } = await processCart(cartId, req.user.email);

      // Calcular el monto total de la compra
      const purchaseDatetime = new Date();
      const amount = productsToPurchase.reduce((total, cartProduct) => {
        return total + cartProduct.product.price * cartProduct.quantity;
      }, 0);

      // Crear un ticket para la compra
      const ticket = new Ticket({
        code: generateUniqueCode(),
        purchase_datetime: purchaseDatetime,
        amount: amount,
        purchaser: req.user.email,
        products: productsToPurchase,
      });

      await ticket.save();

      // Verificar propiedad de productos en el carrito (solo para usuarios premium)
      const productsBelongingToUser = await checkProductsBelongingToUser(cartId, req.user.email);
      if (req.user.role === 'premium' && productsBelongingToUser) {
        return res.status(403).json({ error: 'No puedes comprar un carrito que contiene productos que te pertenecen' });
      }

      // Eliminar productos no comprados del carrito
      await removeProductsFromCart(cartId, productsNotPurchased);

      res.status(200).json({ message: 'Compra completada', productsNotPurchased });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al procesar la compra del carrito' });
    }
  },

  /**
   * Controlador para agregar un producto al carrito.
   * @route POST /api/carts/:pid/add
   * @group Carritos - Operaciones relacionadas con carritos de compra
   * @param {string} pid.path.required - ID del producto a agregar al carrito.
   * @param {integer} quantity.body.required - Cantidad del producto a agregar.
   * @returns {Object} 200 - Mensaje de éxito.
   * @throws {403} - No puedes agregar un producto propio a tu carrito (solo para usuarios premium).
   * @throws {400} - No hay suficiente stock disponible para la cantidad solicitada.
   * @throws {500} - Error al agregar el producto al carrito.
   * @description Agrega un producto al carrito, verificando la disponibilidad de stock y propiedad (solo para usuarios premium).
   */
  addToCart: async (req, res) => {
    const productId = req.params.pid;
    const quantity = parseInt(req.body.quantity);
  
    try {
      // Obtener información del producto
      const product = await ProductDAO.getProductById(productId);
  
      // Verificar propiedad del producto (solo para usuarios premium)
      if (req.user.role === 'premium' && product.owner === req.user.email) {
        return res.status(403).json({ error: 'No puedes agregar a tu carrito un producto que te pertenece' });
      }
  
      // Verificar disponibilidad de stock
      if (quantity > product.stock) {
        return res.status(400).json({ error: 'No hay suficiente stock disponible para agregar la cantidad solicitada' });
      }
  
      // Actualizar el carrito con el nuevo producto
      await updateCart(req.user.cartId, productId, quantity);  // Cambié updatedCart a updateCart
  
      // Guardar los cambios en el carrito
      const updatedCart = await Cart.findById(req.user.cartId);
      await updatedCart.save();
  
      res.status(200).json({ message: 'Producto agregado al carrito exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al agregar el producto al carrito' });
    }
  }

}

export default cartsController;

