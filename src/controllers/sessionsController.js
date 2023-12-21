import passport from 'passport';
import bcrypt from 'bcrypt';
import User from '../dao/models/userModel.js';

/**
 * Controlador para registrar un nuevo usuario.
 * @route POST /api/register
 * @group Sesiones - Operaciones relacionadas con la gestión de sesiones y usuarios
 * @param {string} first_name.body.required - Primer nombre del usuario.
 * @param {string} last_name.body.required - Apellido del usuario.
 * @param {string} email.body.required - Correo electrónico del usuario.
 * @param {number} age.body.required - Edad del usuario.
 * @param {string} password.body.required - Contraseña del usuario.
 * @returns {Object} 201 - Nuevo usuario registrado exitosamente.
 * @throws {400} - El correo electrónico ya está en uso.
 * @throws {500} - Error al registrar el usuario.
 * @description Registra un nuevo usuario en el sistema.
 */
const sessionsController = {
  registerUser: async (req, res) => {
    const { first_name, last_name, email, age, password } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'El correo electrónico ya está en uso.' });
      }

      // Hashear la contraseña antes de almacenarla en la base de datos
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear un nuevo usuario con la contraseña hasheada
      const newUser = new User({
        first_name,
        last_name,
        email,
        age,
        password: hashedPassword,
      });

      // Guardar el nuevo usuario en la base de datos
      await newUser.save();

      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ error: 'Error al registrar el usuario.' });
    }
  },

  /**
   * Controlador para iniciar sesión de usuario.
   * @route POST /api/login
   * @group Sesiones - Operaciones relacionadas con la gestión de sesiones y usuarios
   * @returns {Object} 200 - Sesión iniciada correctamente.
   * @throws {401} - Usuario no autenticado.
   * @description Inicia sesión de usuario utilizando la estrategia local de Passport.
   */
  loginUser: (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        res.json({ message: 'Sesión iniciada correctamente' });
      });
    })(req, res, next);
  },

  /**
   * Controlador para cerrar sesión de usuario.
   * @route GET /api/logout
   * @group Sesiones - Operaciones relacionadas con la gestión de sesiones y usuarios
   * @returns {Object} 200 - Sesión cerrada correctamente.
   * @description Cierra la sesión de usuario actual.
   */
  logoutUser: (req, res) => {
    req.logout();
    res.json({ message: 'Sesión cerrada correctamente' });
  },

  /**
   * Controlador para autenticar con GitHub.
   * @route GET /api/authenticate/github
   * @group Sesiones - Operaciones relacionadas con la gestión de sesiones y usuarios
   * @returns {Object} 302 - Redirige al usuario para autenticación GitHub.
   * @description Inicia el proceso de autenticación con GitHub.
   */
  authenticateGitHub: passport.authenticate('github'),

  /**
   * Controlador para manejar la devolución de llamada de GitHub.
   * @route GET /api/authenticate/github/callback
   * @group Sesiones - Operaciones relacionadas con la gestión de sesiones y usuarios
   * @returns {Object} 302 - Redirige al usuario después de autenticación exitosa o fallida.
   * @description Maneja la devolución de llamada de GitHub y redirige al usuario según el resultado.
   */
  handleGitHubCallback: passport.authenticate('github', {
    successRedirect: '/products',
    failureRedirect: '/login',
  }),

  /**
   * Controlador para obtener el usuario actual.
   * @route GET /api/current-user
   * @group Sesiones - Operaciones relacionadas con la gestión de sesiones y usuarios
   * @returns {Object} 200 - Información del usuario actual.
   * @description Obtiene y devuelve información del usuario actualmente autenticado.
   */
  getCurrentUser: (req, res) => {
    // Aquí obtén la información necesaria del usuario
    const currentUserDTO = {
      username: req.user.username,
      role: req.user.role,
    };

    res.json(currentUserDTO);
  },
};

export default sessionsController;

