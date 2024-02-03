// src/dao/productRepository.js

import Product from './models/productModel.js';

const ProductRepository = {
  getAllProducts: async () => {
    try {
      const products = await Product.find();
      console.log('Productos recuperados desde el Repositorio:', products); // Nuevo registro
      return products.map(product => product.toObject());  // Agrega esta línea para convertir a objeto plano
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
