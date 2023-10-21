import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import User from '../../dao/models/userModel.js';

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

    // Hash de la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea un nuevo usuario con la contraseña hasheada
    const newUser = new User({
      first_name,
      last_name,
      email,
      age,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el usuario.' });
  }
});

// Ruta para iniciar sesión con estrategia local (passport)
sessionsRouter.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      res.json({ message: 'Sesión iniciada correctamente' });
    });
  })(req, res, next);
});

// Ruta para cerrar sesión
sessionsRouter.post('/logout', (req, res) => {
  req.logout();
  res.json({ message: 'Sesión cerrada correctamente' });
});

// Ruta para autenticación de GitHub
sessionsRouter.get('/github', passport.authenticate('github'));

// Ruta de retorno de GitHub después de la autenticación
sessionsRouter.get('/github/callback', passport.authenticate('github', {
  successRedirect: '/products',
  failureRedirect: '/login',
}));

export default sessionsRouter;


