// models/productModel.js
import mongoose from 'mongoose';

/**
 * @typedef Product
 * @property {string} title - Título del producto.
 * @property {string} description - Descripción del producto.
 * @property {number} price - Precio del producto.
 * @property {string} thumbnail - URL de la imagen del producto.
 * @property {string} code - Código único del producto.
 * @property {number} stock - Cantidad disponible en stock.
 */

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  thumbnail: String,
  code: String,
  stock: Number,
});

const Product = mongoose.model('Product', productSchema);

export default Product;


