import passport from 'passport';
import bcrypt from 'bcrypt';
import User from '../dao/models/userModel.js';
import Cart from '../dao/models/cartsModel.js';  // Agrega esta línea


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

      const hashedPassword = await bcrypt.hash(password, 10);

      const newCart = new Cart();
      await newCart.save();

      const newUser = new User({
        first_name,
        last_name,
        email,
        age,
        password: hashedPassword,
        cartId: newCart._id, // Asignar el ID del nuevo carrito al usuario
      });

      // Guardar el nuevo usuario
      await newUser.save();

      // Redirigir al usuario a la página de inicio de sesión después de un registro exitoso
      res.redirect('/products');
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al registrar el usuario.', details: error.message });
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
    passport.authenticate('local', async (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }
      req.logIn(user, async (err) => {
        if (err) {
          return next(err);
        }
        // Almacenar los datos del usuario en la sesión
        req.session.user = {
          cartId: user.cartId,
          username: user.username,
          role: user.role
        };
        console.log(req.session.user.cartId)
        // Redirige al usuario a la página de productos después del inicio de sesión exitoso
        res.redirect('/products');
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
    // Actualizar last_connection al cerrar sesión
    req.user.last_connection = Date.now();
    req.user.save();

    req.logout();
    res.redirect('/'); // Cambiado a res.redirect
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
    const currentUserDTO = {
      username: req.user.username,
      role: req.user.role,
      cartId: req.user.cartId // Agrega el cartId al objeto de respuesta
    };
  
    res.json(currentUserDTO);
  },

  /**
   * Controlador para realizar el seguimiento de la última conexión del usuario.
   * @route POST /api/sessions/track-last-connection
   * @group Sesiones - Operaciones relacionadas con la gestión de sesiones y usuarios
   * @returns {Object} 200 - Mensaje de éxito y detalles actualizados del usuario.
   * @throws {404} - Usuario no encontrado.
   * @throws {500} - Error al realizar el seguimiento de la última conexión.
   * @description Realiza el seguimiento de la última conexión del usuario.
   */
  trackLastConnection: async (req, res) => {
    const userId = req.user.id;

    try {
      // Buscar el usuario por ID
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Actualizar last_connection al realizar el seguimiento
      user.last_connection = Date.now();
      await user.save();

      // Responder con un mensaje de éxito y los detalles actualizados del usuario
      res.status(200).json({ message: 'Seguimiento de última conexión realizado exitosamente', user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al realizar el seguimiento de la última conexión' });
    }
  },
};

export default sessionsController;


