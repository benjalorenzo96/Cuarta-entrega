// middleware/authorizationMiddleware.js

const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Acceso no autorizado' });
    }
  };
  
  const authorizeUser = (req, res, next) => {
    if (req.user && req.user.role === 'user') {
      next();
    } else {
      res.status(403).json({ error: 'Acceso no autorizado' });
    }
  };
  
  export { authorizeAdmin, authorizeUser };
  