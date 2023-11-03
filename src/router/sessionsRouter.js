import express from 'express';
import sessionsController from '../controllers/sessionsController.js';

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

export default sessionsRouter;



