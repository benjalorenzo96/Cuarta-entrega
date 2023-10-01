import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import exphbs from 'express-handlebars';
import usersRouter from './src/router/usersRouter.js'; // Importa el usersRouter
import petsRouter from './src/router/petsRouter.js'; // Importa el petsRouter
import sessionsRouter from './src/router/sessionsRouter.js'; // Importa el sessionsRouter
import viewsRouter from './src/router/viewsRouter.js'; // Importa el viewsRouter
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import session from 'express-session'; // Importa express-session


const app = express(); // Crear la instancia de Express
const httpServer = http.createServer(app); // Crear el servidor HTTP
const io = new Server(httpServer); // Crear la instancia de Socket.IO

// Conectar a la base de datos MongoDB
mongoose.connect('mongodb+srv://benjalorenzo96:Benjam96@codercluster.8hfnnf7.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', () => {
  console.log('Conexión a MongoDB exitosa.');
});

// Configurar el motor de plantillas
app.engine(
  'handlebars',
  exphbs({
    extname: '.handlebars', // Extensión de los archivos de plantilla
    defaultLayout: 'main', // Layout por defecto
  })
);
app.set('view engine', 'handlebars');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar express-session
app.use(
  session({
    secret: 'tu-secreto', // Cambia esto a una cadena segura
    resave: false,
    saveUninitialized: false,
  })
);

app.use('/api/users', usersRouter);
app.use('/api/pets', petsRouter);
app.use('/api/sessions', sessionsRouter); // Agrega el router de sesiones
app.use('/', viewsRouter); // Agrega el router de vistas en la ruta base

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// Configurar WebSocket
io.on('connection', (socket) => {
  console.log('Usuario conectado al socket');

  socket.on('addProduct', (product) => {
    // Lógica para agregar el producto y emitir el evento
    io.emit('productAdded', product);
  });

  // Manejar otros eventos de WebSocket aquí

  socket.on('disconnect', () => {
    console.log('Usuario desconectado del socket');
  });
});

// Ruta para la vista en tiempo real
app.get('/realtimeproducts', (req, res) => {
  const products = []; // Obtener los productos de alguna manera (puede ser desde tu ProductManager)
  res.render('realTimeProducts', { products }); // Renderizar la vista con los productos
});

// Resto de tus rutas y código existente

export { app, httpServer, io };



