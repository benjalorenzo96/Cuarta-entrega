import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(new URL(import.meta.url).pathname, 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

const petsController = {
  getPets: (req, res) => {
    res.json(pets);
  },

  createPet: (req, res) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al subir la imagen' });
      }

      const newPet = {
        name: req.body.name,
        thumbnail: `/uploads/${req.file.filename}`,
      };
      pets.push(newPet);
      res.status(201).json(newPet);
    });
  },
};

export default petsController;
