import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  thumbnail: String,
  code: String,
  stock: Number,
  owner: {
    type: String, 
    ref: 'User', // Referencia al modelo de usuarios
    default: 'admin', // Establezco 'admin' como valor por defecto
  },
});

const Product = mongoose.model('Product', productSchema);

export default Product;

