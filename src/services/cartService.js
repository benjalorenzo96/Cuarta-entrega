import Cart from '../dao/models/cartModel.js';
import productService from './productService.js';
import ticketService from './ticketService.js';

/**
 * Procesa el carrito para realizar la compra.
 * @param {string} cartId - ID del carrito.
 * @param {string} purchaserEmail - Correo electrónico del comprador.
 * @returns {Object} - Objeto con productos comprados y no comprados.
 * @throws {Error} - Error al procesar la compra del carrito.
 */
export const processCart = async (cartId, purchaserEmail) => {
  // Obtener el carrito con productos populados
  const cart = await Cart.findById(cartId).populate('items.product');
  const productsToPurchase = [];
  const productsNotPurchased = [];

  // Iterar sobre los productos en el carrito
  for (const item of cart.items) {
    const product = item.product;
    const quantityToPurchase = item.quantity;

    // Verificar el stock del producto
    if (product.stock >= quantityToPurchase) {
      // Actualizar el stock del producto y agregarlo a la lista de productos comprados
      const updatedStock = product.stock - quantityToPurchase;
      await productService.updateProductStock(product._id, updatedStock);

      productsToPurchase.push({
        productId: product._id,
        quantity: quantityToPurchase,
      });
    } else {
      // Agregar el producto a la lista de productos no comprados
      productsNotPurchased.push(product._id);
    }
  }

  return { productsToPurchase, productsNotPurchased };
};

/**
 * Genera un código único.
 * @returns {string} - Código único generado.
 */
export const generateUniqueCode = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Verifica si algunos productos en el carrito pertenecen al usuario.
 * @param {string} cartId - ID del carrito.
 * @param {string} userEmail - Correo electrónico del usuario.
 * @returns {boolean} - true si algunos productos pertenecen al usuario, false en caso contrario.
 */
export const checkProductsBelongingToUser = async (cartId, userEmail) => {
  // Obtener el carrito con productos populados
  const cart = await Cart.findById(cartId).populate('items.product');
  return cart.items.some((cartProduct) => cartProduct.product.owner === userEmail);
};

/**
 * Elimina productos no comprados del carrito.
 * @param {string} cartId - ID del carrito.
 * @param {Array<string>} productsNotPurchased - Lista de IDs de productos no comprados.
 */
export const removeProductsFromCart = async (cartId, productsNotPurchased) => {
  // Obtener el carrito
  const cart = await Cart.findById(cartId);

  // Filtrar los productos no comprados del carrito
  cart.items = cart.items.filter((cartProduct) => !productsNotPurchased.includes(cartProduct.product._id.toString()));

  // Guardar el carrito actualizado
  await cart.save();
};

/**
 * Actualiza el carrito con un producto específico.
 * @param {string} cartId - ID del carrito.
 * @param {object} product - Objeto del producto a agregar.
 * @param {number} quantity - Cantidad del producto a agregar.
 */
export const updateCart = async (cartId, product, quantity) => {
  try {
    const cart = await Cart.findById(cartId);
    
    // Verificar si el producto ya está en el carrito
    const existingProductIndex = cart.products.findIndex(item => item.product.equals(product._id));

    if (existingProductIndex !== -1) {
      // Si el producto ya está en el carrito, actualiza la cantidad
      cart.products[existingProductIndex].quantity += quantity;
    } else {
      // Si el producto no está en el carrito, agrégalo
      cart.products.push({ product: product._id, quantity });
    }

    // Guardar el carrito actualizado
    await cart.save();

    return cart;
  } catch (error) {
    throw new Error('Error al actualizar el carrito');
  }
};


export default cartService;
