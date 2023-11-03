import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import exphbs from 'express-handlebars';
import usersRouter from './src/router/usersRouter.js';
import petsRouter from './src/router/petsRouter.js';
import sessionsRouter from './src/router/sessionsRouter.js';
import viewsRouter from './src/router/viewsRouter.js';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from 'passport';
import GitHubStrategy from 'passport-github2';
import bcrypt from 'bcrypt';
import User from './src/dao/models/userModel.js';
import LocalStrategy from 'passport-local';
import dotenv from 'dotenv';
import { program } from 'commander';
import config from './config.js';


program.option('--mode <mode>', 'Especificar el modo (development o production)').parse(process.argv);
const options = program.opts();
const mode = options.mode || 'development';

// Usa este valor para cargar el archivo .env correspondiente
if (mode === 'development') {
  dotenv.config({ path: '.env.development' });
} else if (mode === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  console.error('Modo no válido. Debes usar "development" o "production".');
  process.exit(1);
}

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);

// Conectar a la base de datos MongoDB
mongoose.connect(config.databaseConnectionString, {
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
    extname: '.handlebars',
    defaultLayout: 'main',
  })
);
app.set('view engine', 'handlebars');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar express-session
app.use(
  session({
    secret: config.secretKey,
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
        const user = await User.findOne({ email });

        if (!user) {
          return done(null, false, { message: 'Usuario no encontrado' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return done(null, false, { message: 'Contraseña incorrecta' });
        }

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
      clientID: config.githubClientID,
      clientSecret: config.githubClientSecret,
      callbackURL: 'http://localhost:8080/api/sessions/github/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ githubId: profile.id });

        if (existingUser) {
          return done(null, existingUser);
        }

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

app.get('/auth/github', passport.authenticate('github'));

app.get(
  '/auth/github/callback',
  passport.authenticate('github', {
    successRedirect: '/products',
    failureRedirect: '/login',
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/users', usersRouter);
app.use('/api/pets', petsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/', viewsRouter);

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



