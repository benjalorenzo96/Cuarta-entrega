import express from 'express';
import User from '../../dao/models/userModel.js'; // Asegúrate de importar tu modelo de usuario

const sessionsRouter = express.Router();

// Ruta para registrar un nuevo usuario
sessionsRouter.post('/register', async (req, res) => {
  const { first_name, last_name, email, age, password } = req.body;

  try {
    // Verifica si el correo electrónico ya está en uso
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El correo electrónico ya está en uso.' });
    }

    // Crea un nuevo usuario
    const newUser = new User({ first_name, last_name, email, age, password });
    await newUser.save();

    // Puedes agregar lógica adicional, como iniciar sesión automáticamente después del registro

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el usuario.' });
  }
});

// Ruta para iniciar sesión
sessionsRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verifica si el usuario existe en la base de datos
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // Almacena el usuario en la sesión
    req.session.user = user;

    res.json({ message: 'Inicio de sesión exitoso.', user });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
});

// Ruta para cerrar sesión
sessionsRouter.post('/logout', (req, res) => {
  // Destruye la sesión actual
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al cerrar sesión.' });
    }
    res.json({ message: 'Sesión cerrada correctamente.' });
  });
});

export default sessionsRouter;
