import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: {
    type: String,
    unique: true, // Asegura que el correo electrónico sea único
  },
  age: Number,
  password: String, // Este campo debe almacenar la contraseña hasheada
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart', // Referencia al modelo de carritos
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'premium'], // Se añade 'premium' al conjunto de roles permitidos
    default: 'user', // Se establece 'user' como valor por defecto
  },
});

const User = mongoose.model('User', userSchema);

export default User;

