import Cart from '../dao/models/cartsModel.js';
import Ticket from '../dao/models/ticketModel.js';
import ProductDAO from '../dao/productDAO.js';
import { processCart, generateUniqueCode } from '../services/cartService.js';
import { checkProductsBelongingToUser } from '../services/cartService.js';
import { updateCart } from '../services/cartService.js';


const cartsController = {

  /**
   * Controlador para obtener un carrito por su ID.
   * @route GET /api/carts/:cid
   * @group Carritos - Operaciones relacionadas con carritos de compra
   * @param {string} cid.path.required - ID del carrito.
   * @returns {Object} 200 - Detalles del carrito.
   * @throws {404} - Carrito no encontrado.
   * @throws {500} - Error al obtener detalles del carrito.
   * @description Obtiene información detallada de un carrito, incluidos los productos en él.
   */
  getCartById: async (req, res) => {
    const cartId = req.params.cid;

    try {
      const cart = await Cart.findById(cartId); // Ajusta según tu modelo y lógica
      if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
      }

      res.status(200).json(cart);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener detalles del carrito' });
    }
  },

  /**
   * Controlador para eliminar un producto del carrito.
   * @route DELETE /api/carts/:cid/products/:pid
   * @group Carritos - Operaciones relacionadas con carritos de compra
   * @param {string} cid.path.required - ID del carrito.
   * @param {string} pid.path.required - ID del producto a eliminar del carrito.
   * @returns {Object} 200 - Mensaje de éxito.
   * @throws {404} - Producto no encontrado en el carrito.
   * @throws {500} - Error al eliminar el producto del carrito.
   * @description Elimina un producto específico del carrito.
   */
  deleteProductFromCart: async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;

    try {
      // Implementa la lógica para eliminar el producto del carrito
      // (puedes usar Cart.findByIdAndUpdate o el método que prefieras)
      await Cart.findByIdAndUpdate(cartId, { $pull: { products: { productId } } });

      res.status(200).json({ message: 'Producto eliminado del carrito exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar el producto del carrito' });
    }
  },

  /**
   * Controlador para actualizar el carrito con un arreglo de productos.
   * @route PUT /api/carts/:cid
   * @group Carritos - Operaciones relacionadas con carritos de compra
   * @param {string} cid.path.required - ID del carrito.
   * @returns {Object} 200 - Mensaje de éxito.
   * @throws {500} - Error al actualizar el carrito.
   * @description Actualiza el carrito con un nuevo arreglo de productos.
   */
  updateCart: async (req, res) => {
    const cartId = req.params.cid;

    try {
      // Implementa la lógica para actualizar el carrito
      // (puedes usar Cart.findByIdAndUpdate o el método que prefieras)
      await Cart.findByIdAndUpdate(cartId, { $set: { products: req.body.products } });

      res.status(200).json({ message: 'Carrito actualizado exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar el carrito' });
    }
  },

  /**
   * Controlador para actualizar la cantidad de ejemplares del producto en el carrito.
   * @route PUT /api/carts/:cid/products/:pid
   * @group Carritos - Operaciones relacionadas con carritos de compra
   * @param {string} cid.path.required - ID del carrito.
   * @param {string} pid.path.required - ID del producto en el carrito.
   * @returns {Object} 200 - Mensaje de éxito.
   * @throws {500} - Error al actualizar la cantidad de ejemplares.
   * @description Actualiza la cantidad de ejemplares del producto en el carrito.
   */
  updateProductQuantity: async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const newQuantity = req.body.quantity;

    try {
      // Implementa la lógica para actualizar la cantidad de ejemplares del producto en el carrito
      // (puedes usar Cart.findOneAndUpdate o el método que prefieras)
      await Cart.findOneAndUpdate({ _id: cartId, 'products.productId': productId },
        { $set: { 'products.$.quantity': newQuantity } });

      res.status(200).json({ message: 'Cantidad de producto actualizada exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar la cantidad de ejemplares' });
    }
  },

  /**
   * Controlador para eliminar todos los productos del carrito.
   * @route DELETE /api/carts/:cid
   * @group Carritos - Operaciones relacionadas con carritos de compra
   * @param {string} cid.path.required - ID del carrito.
   * @returns {Object} 200 - Mensaje de éxito.
   * @throws {500} - Error al eliminar los productos del carrito.
   * @description Elimina todos los productos del carrito.
   */
  deleteCart: async (req, res) => {
    const cartId = req.params.cid;

    try {
      // Implementa la lógica para eliminar todos los productos del carrito
      // (puedes usar Cart.findByIdAndUpdate o el método que prefieras)
      await Cart.findByIdAndUpdate(cartId, { $set: { products: [] } });

      res.status(200).json({ message: 'Productos eliminados del carrito exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar los productos del carrito' });
    }
  },
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
    const productsBelongingToUserFlag = await checkProductsBelongingToUser(cartId, req.user.email);

    if (req.user.role === 'premium' && productsBelongingToUserFlag) {
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
  // Controlador para agregar un producto al carrito
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
      await updateCart(req.user.cartId, productId, quantity);
  
      // Obtén el carrito actualizado y responde con éxito
      const updatedCart = await Cart.findById(req.user.cartId);
  
      res.status(200).json({ message: 'Producto agregado al carrito exitosamente', updatedCart });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al agregar el producto al carrito' });
    }
  }
}

export default cartsController;

