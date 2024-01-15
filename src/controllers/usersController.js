import { createUser, getAllUsers } from '../dao/mongo/usersMongoManager.js';
import User from '../dao/models/userModel.js';

/**
 * Controlador para obtener todos los usuarios.
 * @route GET /api/users
 * @group Usuarios - Operaciones relacionadas con usuarios
 * @returns {Array.<Object>} 200 - Lista de usuarios.
 * @throws {500} - Error al obtener usuarios.
 * @description Obtiene la lista de todos los usuarios registrados.
 */
const usersController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener usuarios' });
    }
  },

  /**
   * Controlador para crear un nuevo usuario.
   * @route POST /api/users
   * @group Usuarios - Operaciones relacionadas con usuarios
   * @param {string} username.body.required - Nombre de usuario.
   * @param {string} email.body.required - Correo electrónico del usuario.
   * @param {string} password.body.required - Contraseña del usuario.
   * @returns {Object} 201 - Nuevo usuario creado.
   * @throws {400} - Campos obligatorios no proporcionados o correo electrónico en uso.
   * @throws {500} - Error al crear el usuario.
   * @description Crea un nuevo usuario con los detalles proporcionados.
   */
  createUser: async (req, res) => {
    const { username, email, password } = req.body;

    // Verificar si todos los campos obligatorios están presentes
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    try {
      // Verificar si el correo electrónico ya está en uso
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'El correo electrónico ya está en uso.' });
      }

      // Crear un nuevo usuario y devolverlo como respuesta
      const newUser = await createUser({ username, email, password });
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear el usuario' });
    }
  },

  /**
   * Controlador para cambiar el rol de un usuario.
   * @route PUT /api/users/{uid}/role
   * @group Usuarios - Operaciones relacionadas con usuarios
   * @param {string} uid.path.required - ID del usuario.
   * @param {Object} role.body.required - Nuevo rol del usuario.
   * @returns {Object} 200 - Mensaje de éxito y detalles actualizados del usuario.
   * @throws {400} - Rol no válido.
   * @throws {404} - Usuario no encontrado.
   * @throws {500} - Error al cambiar el rol de usuario.
   * @description Cambia el rol de un usuario específico.
   */
  changeUserRole: async (req, res) => {
    const userId = req.params.uid;
    const { role } = req.body;

    try {
      // Buscar el usuario por ID
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Verificar si el nuevo rol es válido
      if (role !== 'user' && role !== 'premium') {
        return res.status(400).json({ error: 'Rol no válido' });
      }

      // Cambiar el rol del usuario y guardar los cambios
      user.role = role;
      await user.save();

      // Responder con un mensaje de éxito y los detalles actualizados del usuario
      res.status(200).json({ message: 'Rol de usuario cambiado exitosamente', user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al cambiar el rol de usuario' });
    }
  },
   /**
   * Controlador para subir documentos y actualizar el estado del usuario.
   * @route POST /api/users/{uid}/documents
   * @group Usuarios - Operaciones relacionadas con usuarios
   * @param {string} uid.path.required - ID del usuario.
   * @param {Array} document.body.required - Archivos de documentos a subir.
   * @returns {Object} 200 - Mensaje de éxito y detalles actualizados del usuario.
   * @throws {400} - Archivos de documentos no proporcionados.
   * @throws {404} - Usuario no encontrado.
   * @throws {500} - Error al subir documentos o actualizar el usuario.
   * @description Sube documentos y actualiza el estado del usuario.
   */
   uploadDocuments: async (req, res) => {
    const userId = req.params.uid;
    const documents = req.files; // El array de documentos se encuentra en req.files

    try {
      // Verificar si se proporcionaron documentos
      if (!documents || documents.length === 0) {
        return res.status(400).json({ error: 'Archivos de documentos no proporcionados.' });
      }

      // Buscar el usuario por ID
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Actualizar el estado del usuario y guardar los cambios
      user.documents = documents.map((document) => ({
        name: document.originalname,
        reference: `/uploads/documents/${document.filename}`,
      }));

      await user.save();

      // Responder con un mensaje de éxito y los detalles actualizados del usuario
      res.status(200).json({ message: 'Documentos subidos y usuario actualizado exitosamente', user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al subir documentos o actualizar el usuario' });
    }
  },
};

export default usersController;

