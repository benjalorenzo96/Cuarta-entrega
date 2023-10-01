import express from 'express';
import User from '../../dao/models/userModel.js'; // Asegúrate de importar tu modelo de usuario

const viewsRouter = express.Router();

// Middleware para verificar la autenticación del usuario
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    // El usuario está autenticado, continúa con la solicitud
    next();
  } else {
    // El usuario no está autenticado, redirige al formulario de inicio de sesión
    res.redirect('/login');
  }
}

// Ruta para el formulario de registro
viewsRouter.get('/register', (req, res) => {
  res.render('register'); // Renderiza el formulario de registro
});

// Ruta para el formulario de inicio de sesión
viewsRouter.get('/login', (req, res) => {
  res.render('login'); // Renderiza el formulario de inicio de sesión
});

// Ruta para el perfil del usuario (requiere autenticación)
viewsRouter.get('/profile', isAuthenticated, (req, res) => {
  const user = req.session.user; // El usuario autenticado está en la sesión
  res.render('profile', { user }); // Renderiza la vista de perfil con los datos del usuario
});

export default viewsRouter;
