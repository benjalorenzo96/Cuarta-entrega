import Cart from '../dao/models/cartsModel.js';

const cartsController = {
  getCartById: async (req, res) => {
    const cartId = req.params.cid;
    try {
      const cart = await Cart.findById(cartId).populate('products.product', 'title price');
      if (cart) {
        res.json(cart);
      } else {
        res.status(404).json({ error: 'Carrito no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener carrito' });
    }
  },

  deleteProductFromCart: async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;

    try {
      const cart = await Cart.findById(cartId);

      if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
      }

      const productIndex = cart.products.findIndex((p) => p.product.toString() === productId);

      if (productIndex === -1) {
        return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
      }

      cart.products.splice(productIndex, 1);
      await cart.save();

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar producto del carrito' });
    }
  },

  updateCart: async (req, res) => {
    const cartId = req.params.cid;
    const productsToUpdate = req.body.products;

    try {
      const cart = await Cart.findById(cartId);

      if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
      }

      cart.products = productsToUpdate;
      await cart.save();

      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el carrito' });
    }
  },

  updateProductQuantity: async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.body.quantity;

    try {
      const cart = await Cart.findById(cartId);

      if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
      }

      const product = cart.products.find((p) => p.product.toString() === productId);

      if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
      }

      product.quantity = quantity;
      await cart.save();

      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la cantidad del producto en el carrito' });
    }
  },

  deleteCart: async (req, res) => {
    const cartId = req.params.cid;

    try {
      await Cart.findByIdAndDelete(cartId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar carrito' });
    }
  },
};

export default cartsController;
