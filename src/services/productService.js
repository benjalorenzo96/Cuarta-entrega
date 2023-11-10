// services/productService.js
import Product from '../dao/models/productModel.js';

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

  // Puedes agregar otras funciones relacionadas con productos aquí si es necesario
};

export default productService;
