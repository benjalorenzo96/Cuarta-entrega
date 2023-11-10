// services/cartService.js

import Cart from '../dao/models/cartModel.js';
import productService from './productService.js';
import ticketService from './ticketService.js';

const cartService = {
  // ... otras funciones del servicio

  purchaseCart: async (cartId, purchaserEmail) => {
    try {
      const cart = await Cart.findById(cartId).populate('items.product');
      const productsToPurchase = [];
      const productsNotPurchased = [];

      for (const item of cart.items) {
        const product = item.product;
        const quantityToPurchase = item.quantity;

        // Verificar el stock del producto
        if (product.stock >= quantityToPurchase) {
          // Restar la cantidad del stock del producto
          const updatedStock = product.stock - quantityToPurchase;
          await productService.updateProductStock(product._id, updatedStock);

          // Agregar el producto a la lista de compras
          productsToPurchase.push({
            productId: product._id,
            quantity: quantityToPurchase,
          });
        } else {
          // Agregar el producto a la lista de no comprados
          productsNotPurchased.push(product._id);
        }
      }

      // Generar un ticket con los productos comprados
      const totalAmount = productsToPurchase.reduce((total, product) => {
        const productInCart = cart.items.find((item) => item.product._id.equals(product.productId));
        return total + productInCart.product.price * product.quantity;
      }, 0);

      const ticket = await ticketService.createTicket({
        code: generateUniqueCode(), // Necesitarás implementar esta función
        amount: totalAmount,
        purchaser: purchaserEmail,
      });

      // Filtrar los productos no comprados en el carrito
      const updatedCartItems = cart.items.filter(
        (item) => !productsNotPurchased.includes(item.product._id.toString())
      );

      // Actualizar el carrito con los productos no comprados
      await Cart.findByIdAndUpdate(cartId, { items: updatedCartItems });

      return { ticket, productsNotPurchased };
    } catch (error) {
      console.error(error);
      throw new Error('Error al procesar la compra del carrito.');
    }
  },
};

export default cartService;
