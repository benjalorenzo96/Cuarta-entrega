// src/dao/productRepository.js

import Product from './models/productModel.js';

const ProductRepository = {
  getAllProducts: async () => {
    try {
      return await Product.find();
    } catch (error) {
      throw new Error('Error al obtener todos los productos desde el Repositorio', error);
    }
  },

  getProductById: async (productId) => {
    try {
      return await Product.findById(productId);
    } catch (error) {
      throw new Error('Error al obtener el producto desde el Repositorio', error);
    }
  },

  // Puedes agregar más métodos según sea necesario para tu lógica de negocio
};

export default ProductRepository;
