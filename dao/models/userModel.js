import mongoose from 'mongoose';

// Define el esquema de usuario
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String, // Debes considerar el cifrado de contraseñas en un entorno de producción
  // Agrega otras propiedades de usuario según tus necesidades
});

const User = mongoose.model('User', userSchema);

export default User;
