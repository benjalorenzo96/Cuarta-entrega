// services/productService.js
import Product from '../dao/models/productModel.js'; // Asegúrate de tener esta línea

const productService = {
  getTotalProducts: async (filter) => {
    try {
      const totalProducts = await Product.countDocuments(filter);
      return totalProducts;
    } catch (error) {
      console.error(error);
      throw new Error('Error al obtener el total de productos');
    }
  },

  getProducts: async (filter, skip, limit, sortOptions) => {
    try {
      const products = await Product.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);

      return products;
    } catch (error) {
      console.error(error);
      throw new Error('Error al obtener productos paginados');
    }
  },

  renderProductsView: async (req, res, totalPages, page, limit) => {
    try {
      const user = req.session.user;
      const products = await productService.getProducts({}, (page - 1) * limit, limit, {});

      res.render('products', { user, products, totalPages, page, limit });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener la lista de productos' });
    }
  },

  // ... otros métodos
};

export default productService;

