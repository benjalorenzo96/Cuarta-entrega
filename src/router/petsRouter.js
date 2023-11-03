import express from 'express';
import petsController from '../controllers/petsController.js';

const petsRouter = express.Router();

// Ruta para obtener todos los pets
petsRouter.get('/', petsController.getPets);

// Ruta para crear un nuevo pet
petsRouter.post('/', petsController.createPet);

export default petsRouter;



