import express from 'express';
import { createUser, getAllUsers } from '../../dao/mongo/usersMongoManager.js';
import User from '../../dao/models/userModel.js';

const usersRouter = express.Router();

// Obtener todos los usuarios
usersRouter.get('/', async (req, res) => {
  try {
    const users = await getAllUsers(); // Utiliza la función para obtener todos los usuarios
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Crear un nuevo usuario
usersRouter.post('/', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El correo electrónico ya está en uso.' });
    }

    const newUser = await createUser({ username, email, password }); // Utiliza la función para crear un nuevo usuario
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
});

export default usersRouter;

