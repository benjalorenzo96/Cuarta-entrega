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
import passport from 'passport'; // Importa passport
import GitHubStrategy from 'passport-github2'; // Importa GitHubStrategy
import bcrypt from 'bcrypt'; // Importa bcrypt
import User from './dao/models/userModel.js'; // Asegúrate de importar tu modelo de usuario
import LocalStrategy from 'passport-local'; // Importa LocalStrategy si usas esta estrategia


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

// Configuración de Passport para la estrategia local
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        // Buscar al usuario en la base de datos por su correo electrónico
        const user = await User.findOne({ email });

        // Si no se encuentra el usuario, devolver un mensaje de error
        if (!user) {
          return done(null, false, { message: 'Usuario no encontrado' });
        }

        // Verificar la contraseña
        const passwordMatch = await bcrypt.compare(password, user.password);

        // Si la contraseña no coincide, devolver un mensaje de error
        if (!passwordMatch) {
          return done(null, false, { message: 'Contraseña incorrecta' });
        }

        // Si las credenciales son válidas, devolver el usuario autenticado
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);
// Configurar Passport para la autenticación de GitHub
passport.use(
  new GitHubStrategy(
    {
      clientID: 'Iv1.f832426aac67f628', // Reemplaza con tu Client ID de GitHub
      clientSecret: '397af14ae92d316d3f6e93c3e192604f0732c0bb', // Reemplaza con tu Client Secret de GitHub
      callbackURL: 'http://localhost:8080/api/sessions/github/callback', // Reemplaza con la URL correcta
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Verificar si el usuario ya existe en la base de datos
        const existingUser = await User.findOne({ githubId: profile.id });

        if (existingUser) {
          return done(null, existingUser);
        }

        // Si no existe, crea un nuevo usuario con la información de GitHub
        const newUser = new User({
          username: profile.username,
          githubId: profile.id,
          password: '', // Debe estar vacío para los usuarios de GitHub
        });

        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        return done(error);
      }
    }
  )
);


// Configuración de Passport para serialización y deserialización de usuarios
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).exec();
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Ruta para la autenticación de GitHub
app.get('/auth/github', passport.authenticate('github'));

app.get(
  '/auth/github/callback',
  passport.authenticate('github', {
    successRedirect: '/products', // Redirige a la vista de productos después de la autenticación
    failureRedirect: '/login', // Redirige al formulario de inicio de sesión en caso de error
  })
);
app.use(passport.initialize()); // Inicializa Passport
app.use(passport.session()); // Habilita la persistencia de sesiones de Passport

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

// Ruta principal para mostrar el formulario de inicio de sesión
app.get('/', (req, res) => {
  res.render('login'); // Renderiza el formulario de inicio de sesión
});

// Resto de tus rutas y código existente

export { app, httpServer, io };



