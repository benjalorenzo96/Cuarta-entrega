// controllers/sessionsController.js

import passport from 'passport';
import bcrypt from 'bcrypt';
import User from '../dao/models/userModel.js';

const sessionsController = {
  registerUser: async (req, res) => {
    const { first_name, last_name, email, age, password } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'El correo electrónico ya está en uso.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

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
  },

  loginUser: (req, res, next) => {
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
  },

  logoutUser: (req, res) => {
    req.logout();
    res.json({ message: 'Sesión cerrada correctamente' });
  },

  authenticateGitHub: passport.authenticate('github'),

  handleGitHubCallback: passport.authenticate('github', {
    successRedirect: '/products',
    failureRedirect: '/login',
  }),

  // Nueva ruta para obtener el usuario actual
  getCurrentUser: (req, res) => {
    // Aquí obtén la información necesaria del usuario
    const currentUserDTO = {
      username: req.user.username,
      role: req.user.role,
    };

    res.json(currentUserDTO);
  },
};

export default sessionsController;

