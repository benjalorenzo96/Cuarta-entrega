import express from 'express';
import path from 'path';
import exphbs from 'express-handlebars';
import http from 'http';
import { Server } from 'socket.io';
import usersRouter from './usersRouter.js';
import petsRouter from './petsRouter.js';
import ProductManager from './ProductManager.js';

const app = express(); // Crear la instancia de Express

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

const httpServer = http.createServer(app); // Crear el servidor HTTP

const io = new Server(httpServer); // Crear instancia de Socket.io y pasar el servidor HTTP

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', usersRouter);
app.use('/api/pets', petsRouter);

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

const PORT = 8080;
httpServer.listen(PORT, () => {
  console.log(`Servidor Express y WebSocket escuchando en el puerto ${PORT}`);
});
