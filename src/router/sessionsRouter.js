import express from 'express';
import sessionsController from '../controllers/sessionsController.js';
import passwordResetController from '../controllers/passwordResetController.js';

const sessionsRouter = express.Router();

// Ruta para registrar un nuevo usuario
sessionsRouter.post('/register', sessionsController.registerUser);

// Ruta para iniciar sesión con estrategia local (passport)
sessionsRouter.post('/login', sessionsController.loginUser);

// Ruta para cerrar sesión
sessionsRouter.post('/logout', sessionsController.logoutUser);

// Ruta para autenticación de GitHub
sessionsRouter.get('/github', sessionsController.authenticateGitHub);

// Ruta de retorno de GitHub después de la autenticación
sessionsRouter.get('/github/callback', sessionsController.handleGitHubCallback);

// Ruta para solicitar restablecimiento de contraseña
sessionsRouter.post('/forgot-password', passwordResetController.requestPasswordReset);

// Ruta para restablecer contraseña
sessionsRouter.post('/reset-password', passwordResetController.resetPassword);

// Ruta para realizar el seguimiento de la última conexión del usuario
sessionsRouter.post('/track-last-connection', sessionsController.trackLastConnection);

export default sessionsRouter;



