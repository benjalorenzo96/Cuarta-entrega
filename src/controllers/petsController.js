import multer from 'multer';
import path from 'path';

// Configuración de multer para gestionar la subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Establece la carpeta de destino para los archivos subidos
    cb(null, path.join(new URL(import.meta.url).pathname, 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    // Genera un nombre de archivo único basado en la marca de tiempo
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

const petsController = {
  // Obtiene la lista de mascotas (no proporcionas la definición de 'pets')
  getPets: (req, res) => {
    res.json(pets); // Se asume que 'pets' es una variable definida en otro lugar
  },

  // Crea una nueva mascota, gestionando la subida de la imagen con multer
  createPet: (req, res) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        // Maneja errores relacionados con la subida de archivos
        return res.status(500).json({ error: 'Error al subir la imagen' });
      }

      // Crea un objeto 'newPet' con los datos de la mascota y la ruta de la imagen
      const newPet = {
        name: req.body.name,
        thumbnail: `/uploads/${req.file.filename}`,
      };

      // Agrega la nueva mascota a la lista de mascotas (asumes que existe una variable 'pets')
      pets.push(newPet);

      // Responde con la nueva mascota creada
      res.status(201).json(newPet);
    });
  },
};

export default petsController;

