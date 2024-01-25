// src/dao/productDAO.js

import ProductRepository from './productRepository.js';

const ProductDAO = {
  getProducts: async () => {
    try {
       return await ProductRepository.getAllProducts();
    } catch (error) {
       throw new Error('Error al obtener todos los productos desde el DAO', error);
    }
 },
 

  getProductById: async (productId) => {
    try {
      return await ProductRepository.getProductById(productId);
    } catch (error) {
      throw new Error('Error al obtener el producto desde el DAO', error);
    }
  },

  // Puedes agregar más métodos según sea necesario para tu lógica de negocio
};

export default ProductDAO;
