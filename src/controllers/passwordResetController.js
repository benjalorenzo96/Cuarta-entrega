import bcrypt from 'bcrypt';
import User from '../dao/models/userModel.js';
import UserToken from '../dao/models/userTokenModel.js'; // Asegúrate de importar el modelo correcto

/**
 * Controlador para solicitar el restablecimiento de contraseña.
 * @route POST /api/reset-password/request
 * @group Restablecimiento de Contraseña - Operaciones relacionadas con el restablecimiento de contraseña
 * @param {string} email.body.required - Correo electrónico del usuario.
 * @returns {Object} 200 - Mensaje de éxito.
 * @throws {404} - Usuario no encontrado.
 * @throws {500} - Error al solicitar restablecimiento de contraseña.
 * @description Envia un correo electrónico con un enlace para restablecer la contraseña.
 */
const passwordResetController = {
  requestPasswordReset: async (req, res) => {
    const { email } = req.body;

    try {
      const usuario = await User.findOne({ email });

      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Generar un token único para el restablecimiento de contraseña
      const token = generarTokenUnico(); // Implementa esta función según tus necesidades
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // Expira en 1 hora

      // Guardar el token en la base de datos
      const userToken = new UserToken({
        userId: usuario._id,
        token,
        expiresAt,
      });

      await userToken.save();

      // Enviar correo electrónico con el enlace de restablecimiento
      const link = `http://tudominio.com/reset-password/${token}`;
      await enviarCorreo(usuario.email, 'Restablecer Contraseña', `Haz clic aquí para restablecer tu contraseña: ${link}`);

      res.status(200).json({ message: 'Correo de restablecimiento enviado exitosamente' });
    } catch (error) {
      console.error('Error al solicitar restablecimiento de contraseña:', error);
      res.status(500).json({ error: 'Error al solicitar restablecimiento de contraseña' });
    }
  },

  /**
   * Controlador para restablecer la contraseña usando un token.
   * @route POST /api/reset-password
   * @group Restablecimiento de Contraseña - Operaciones relacionadas con el restablecimiento de contraseña
   * @param {string} token.body.required - Token para restablecer la contraseña.
   * @param {string} nuevaContraseña.body.required - Nueva contraseña del usuario.
   * @returns {Object} 200 - Mensaje de éxito.
   * @throws {400} - Enlace de restablecimiento inválido o expirado.
   * @throws {500} - Error al restablecer la contraseña.
   * @description Restablece la contraseña del usuario usando el token proporcionado.
   */
  resetPassword: async (req, res) => {
    const { token, nuevaContraseña } = req.body;

    try {
      const userToken = await UserToken.findOne({ token });

      if (!userToken || userToken.expiresAt < new Date()) {
        return res.status(400).json({ message: 'Enlace de restablecimiento inválido o expirado' });
      }

      // Restablecer la contraseña utilizando la función correspondiente
      await restablecerContraseña(userToken.userId, nuevaContraseña);

      // Eliminar el token utilizado
      await userToken.remove();

      res.status(200).json({ message: 'Contraseña restablecida exitosamente' });
    } catch (error) {
      console.error('Error al restablecer la contraseña:', error);
      res.status(500).json({ error: 'Error al restablecer la contraseña' });
    }
  },
};

export default passwordResetController;
