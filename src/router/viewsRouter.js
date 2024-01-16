import express from 'express';
import viewsController from '../controllers/viewsController.js';

const viewsRouter = express.Router();

// // Middleware para verificar la autenticación del usuario
// function isAuthenticated(req, res, next) {
//   if (req.session.user) {
//     // El usuario está autenticado, continúa con la solicitud
//     next();
//   } else {
//     // El usuario no está autenticado, redirige al formulario de inicio de sesión
//     res.redirect('/login');
//   }
// }

// Ruta para el formulario de registro
viewsRouter.get('/register', viewsController.renderRegisterView);

// Ruta para el formulario de inicio de sesión
viewsRouter.get('/login', viewsController.renderLoginView);

// Ruta para la vista de productos (requiere autenticación)
viewsRouter.get('/products', viewsController.renderProductsView);

export default viewsRouter;

