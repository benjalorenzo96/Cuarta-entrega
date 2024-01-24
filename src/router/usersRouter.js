// usersRouter.js
import express from 'express';
import usersController from '../controllers/usersController.js';
import multer from 'multer'; // Importa Multer

const usersRouter = express.Router();

// Configuración de Multer para gestionar la subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determinar la carpeta de destino en función del tipo de archivo
    if (file.fieldname === 'profileImage') {
      cb(null, 'uploads/profiles/');
    } else if (file.fieldname === 'productImage') {
      cb(null, 'uploads/products/');
    } else if (file.fieldname === 'document') {
      cb(null, 'uploads/documents/');
    } else {
      cb({ message: 'Tipo de archivo no válido' }, null);
    }
  },
  filename: (req, file, cb) => {
    // Utilizar el nombre original del archivo
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// Obtener todos los usuarios
usersRouter.get('/', usersController.getAllUsers);

// Crear un nuevo usuario
usersRouter.post('/', usersController.createUser);

// Cambiar el rol de un usuario
usersRouter.post('/:uid', usersController.changeUserRole);

// Nueva ruta para subir documentos
usersRouter.post('/:uid/documents', upload.array('document', 5), usersController.uploadDocuments);

// Obtener todos los usuarios
usersRouter.get('/', usersController.getAllUsers);

// Limpiar usuarios inactivos
usersRouter.delete('/', usersController.clearInactiveUsers);


export default usersRouter;




