/**
 * Controlador de vistas que maneja las renderizaciones de las páginas.
 */
import productService from '../services/productService.js';

const viewsController = {
  /**
   * Renderiza la vista de registro.
   * @param {Object} req - Objeto de solicitud.
   * @param {Object} res - Objeto de respuesta.
   */
  renderRegisterView: (req, res) => {
    res.render('register');
  },

  /**
   * Renderiza la vista de inicio de sesión.
   * @param {Object} req - Objeto de solicitud.
   * @param {Object} res - Objeto de respuesta.
   */
  renderLoginView: (req, res) => {
    res.render('login');
  },

  /**
   * Renderiza la vista de productos.
   * @param {Object} req - Objeto de solicitud.
   * @param {Object} res - Objeto de respuesta.
   */
  renderProductsView: async (req, res) => {
    try {
      const user = req.session.user;
      const products = await productService.getProducts(); // Obtener la lista de productos desde tu servicio

      res.render('products', { user, products });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener la lista de productos' });
    }
  },

  renderLoginButton: (req, res) => {
    res.render('loginButton');
  },
};

export default viewsController;

  