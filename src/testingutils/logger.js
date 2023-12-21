import winston from 'winston';

// Definir niveles de log y colores correspondientes
const logLevels = {
  fatal: 0,
  error: 1,
  warning: 2,
  info: 3,
  http: 4,
  debug: 5,
};

const logColors = {
  fatal: 'red',
  error: 'red',
  warning: 'yellow',
  info: 'green',
  http: 'green',
  debug: 'white',
};

// Configuración del logger para desarrollo
const developmentLogger = winston.createLogger({
  levels: logLevels,
  format: winston.format.simple(),
  transports: [
    // Utiliza la consola para mostrar logs durante el desarrollo
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Configuración del logger para producción
const productionLogger = winston.createLogger({
  levels: logLevels,
  format: winston.format.simple(),
  transports: [
    // Utiliza la consola para mostrar logs de info o superior en producción
    new winston.transports.Console({
      level: 'info',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // Utiliza un archivo para almacenar logs de nivel error en producción
    new winston.transports.File({ filename: 'errors.log', level: 'error' }),
  ],
});

export { developmentLogger, productionLogger };

