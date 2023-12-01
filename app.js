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
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { generateMockProducts } from './mocking.js';
import { errorHandler } from './errorHandler.js';
import { developmentLogger, productionLogger } from './logger.js';
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

// Configurar el logger para el entorno
const logger = process.env.NODE_ENV === 'production' ? productionLogger : developmentLogger;

app.get('/loggerTest', (req, res) => {
  // Ejemplos de logs
  logger.debug('Este es un mensaje de debug');
  logger.http('Este es un mensaje HTTP');
  logger.info('Este es un mensaje de info');
  logger.warning('Este es un mensaje de advertencia');
  logger.error('Este es un mensaje de error');
  logger.fatal('Este es un mensaje fatal');

  res.send('Logs enviados a la consola y archivo (si corresponde).');
});

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

// Configura nodemailer con tus credenciales de Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'benjalorenzo96@gmail.com',
    pass: 'wvno jmxr rmyj xppl',
  },
});

// Configura Twilio con tus credenciales
const twilioClient = twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);

// Ruta para probar el envío de correos con nodemailer
app.post('/mail', async (req, res) => {
  try {
    // Datos del correo
    const mailOptions = {
      from: 'benjalorenzo96@gmail.com',
      to: 'destinatario@gmail.com',
      subject: 'Asunto del correo',
      html: '<p>Contenido del correo con <b>formato HTML</b></p>',
      attachments: [
        {
          filename: 'imagen.png',
          path: '/ruta/a/la/imagen.png',
          cid: 'uniqueId1', // Asocia este CID en el cuerpo del HTML para mostrar la imagen
        },
        // Puedes agregar más attachments según sea necesario
      ],
    };

    // Envía el correo
    const info = await transporter.sendMail(mailOptions);

    // Muestra información de éxito en la consola
    console.log('Correo enviado:', info);

    // Responde al cliente con un mensaje de éxito
    res.status(200).json({ message: 'Correo enviado exitosamente' });
  } catch (error) {
    console.error('Error al enviar el correo:', error);

    // Responde al cliente con un mensaje de error
    res.status(500).json({ error: 'Error al enviar el correo' });
  }
});

// Ruta para probar el envío de mensajes SMS con Twilio
app.post('/sms', async (req, res) => {
  try {
    // Datos del mensaje SMS
    const { to, body } = req.body;

    // Envía el mensaje SMS con Twilio
    const message = await twilioClient.messages.create({
      body,
      from: config.TWILIO_NUMBER,
      to,
    });

    // Muestra información de éxito en la consola
    console.log('Mensaje SMS enviado:', message);

    // Responde al cliente con un mensaje de éxito
    res.status(200).json({ message: 'Mensaje SMS enviado exitosamente' });
  } catch (error) {
    console.error('Error al enviar el mensaje SMS:', error);

    // Responde al cliente con un mensaje de error
    res.status(500).json({ error: 'Error al enviar el mensaje SMS' });
  }
});
// Ruta para generar productos de manera ficticia (mocking)
app.get('/mockingproducts', (req, res) => {
  const mockProducts = generateMockProducts();
  res.json(mockProducts);
});

// Ejemplo de uso del manejador de errores
app.get('/example-error', (req, res, next) => {
  const error = errorHandler('productNotFound');
  next(error);
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  // Log de errores utilizando el logger
  logger.error(`Error: ${err.message}`, { error: err });

  res.status(err.statusCode || 500).json({ error: err.message });
});

export { app, httpServer, io };


