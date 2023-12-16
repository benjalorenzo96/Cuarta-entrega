import { createUser, getAllUsers } from '../dao/mongo/usersMongoManager.js';
import User from '../dao/models/userModel.js';

const usersController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener usuarios' });
    }
  },

  createUser: async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'El correo electrónico ya está en uso.' });
      }

      const newUser = await createUser({ username, email, password });
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear el usuario' });
    }
  },
  changeUserRole: async (req, res) => {
    const userId = req.params.uid;
    const { role } = req.body;

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      if (role !== 'user' && role !== 'premium') {
        return res.status(400).json({ error: 'Rol no válido' });
      }

      user.role = role;
      await user.save();

      res.status(200).json({ message: 'Rol de usuario cambiado exitosamente', user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al cambiar el rol de usuario' });
    }
  },
};

export default usersController;
