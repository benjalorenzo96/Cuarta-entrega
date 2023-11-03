import express from 'express';
import usersController from '../controllers/usersController.js';

const usersRouter = express.Router();

// Obtener todos los usuarios
usersRouter.get('/', usersController.getAllUsers);

// Crear un nuevo usuario
usersRouter.post('/', usersController.createUser);

export default usersRouter;


