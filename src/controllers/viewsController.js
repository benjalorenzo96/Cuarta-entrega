const viewsController = {
    renderRegisterView: (req, res) => {
      res.render('register');
    },
  
    renderLoginView: (req, res) => {
      res.render('login');
    },
  
    renderProductsView: (req, res) => {
      const user = req.session.user;
      const products = []; // Aquí debes obtener la lista de productos, probablemente desde tu base de datos
  
      res.render('products', { user, products });
    },
  };
  
  export default viewsController;
  