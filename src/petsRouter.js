import express from 'express';
import multer from 'multer';
import path from 'path';

const petsRouter = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(new URL(import.meta.url).pathname, 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.originalname}`;
    cb(null, fileName);
  }
});

const upload = multer({ storage: storage });

const pets = [];

petsRouter.get('/', (req, res) => {
  res.json(pets);
});

petsRouter.post('/', upload.single('file'), (req, res) => {
  const newPet = {
    name: req.body.name,
    thumbnail: `/uploads/${req.file.filename}`
  };
  pets.push(newPet);
  res.status(201).json(newPet);
});

export default petsRouter;


