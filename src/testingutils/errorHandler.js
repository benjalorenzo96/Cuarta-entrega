// errorHandler.js
const errorDictionary = {
  productNotFound: { code: 404, message: 'El producto no fue encontrado.' },
  cartNotFound: { code: 404, message: 'El carrito no fue encontrado.' },
  invalidQuantity: { code: 400, message: 'La cantidad proporcionada es inválida.' },
  // Agregar más errores según sea necesario
};

const errorHandler = (errorKey) => {
  const error = errorDictionary[errorKey] || { code: 500, message: 'Error interno del servidor.' };
  const err = new Error(error.message);
  err.statusCode = error.code;
  return err;
};

export { errorHandler };

  