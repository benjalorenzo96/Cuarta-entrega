// errorHandler.js
const errorDictionary = {
    productNotFound: { code: 404, message: 'Producto no encontrado' },
    cartNotFound: { code: 404, message: 'Carrito no encontrado' },
    invalidQuantity: { code: 400, message: 'Cantidad inválida' },
    // Agrega más errores según sea necesario
  };
  
  const errorHandler = (errorKey) => {
    const error = errorDictionary[errorKey] || { code: 500, message: 'Error interno del servidor' };
    const err = new Error(error.message);
    err.statusCode = error.code;
    return err;
  };
  
  export { errorHandler };
  