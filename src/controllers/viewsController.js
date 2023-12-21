/**
 * Controlador de vistas que maneja las renderizaciones de las páginas.
 */
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
  renderProductsView: (req, res) => {
    // Obtiene el usuario de la sesión y una lista de productos (deberías obtenerla desde tu base de datos)
    const user = req.session.user;
    const products = []; // Aquí debes obtener la lista de productos, probablemente desde tu base de datos

    // Renderiza la vista de productos, pasando el usuario y la lista de productos como variables locales
    res.render('products', { user, products });
  },
};

export default viewsController;

  