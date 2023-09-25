import User from '../models/userModel.js';

// Crear un nuevo usuario
async function createUser(userData) {
  try {
    const user = new User(userData);
    await user.save();
    return user;
  } catch (error) {
    throw error;
  }
}

// Obtener todos los usuarios
async function getAllUsers() {
  try {
    return await User.find();
  } catch (error) {
    throw error;
  }
}

export { createUser, getAllUsers };
