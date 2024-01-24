import User from '../dao/models/userModel.js';

const clearInactiveUsers = async (req, res) => {
  try {
    // Obtener usuarios inactivos (última actividad hace más de 2 días)
    const inactiveUsers = await User.find({
      last_activity: { $lt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    });

    // Eliminar usuarios inactivos y enviar correos
    await Promise.all(
      inactiveUsers.map(async (user) => {
        // Enviar correo al usuario indicando la eliminación
        // (Puedes implementar la lógica de envío de correo aquí)

        // Eliminar al usuario
        await User.findByIdAndDelete(user._id);
      })
    );

    res.json({ message: 'Usuarios inactivos eliminados exitosamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al limpiar usuarios inactivos.' });
  }
};

export default clearInactiveUsers;
