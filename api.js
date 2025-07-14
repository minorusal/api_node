const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const cookieParser = require('cookie-parser');
require('dotenv').config();
require('./middlewares/passport');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const mainRouter = require('./routes/index'); // Importar el enrutador principal
const projectsRouter = require('./routes/projects');
const remissionsRouter = require('./routes/remissions');
const menusRouter = require('./routes/menus'); // Añadido
const tempSeedRouter = require('./routes/temp_seed'); // Temporal
const tempTruncateRouter = require('./routes/temp_truncate'); // Temporal

const app = express();
app.use(passport.initialize());

let corsOptions;
if (process.env.CORS_ORIGIN) {
    const allowedOrigins = process.env.CORS_ORIGIN.split(',').map(o => o.trim());
    if (!allowedOrigins.includes('http://localhost:4200')) {
        allowedOrigins.push('http://localhost:4200');
    }
    corsOptions = {
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error('Not allowed by CORS'));
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'token'],
        credentials: true
    };
} else {
    corsOptions = {
        origin: true, // reflect origin header
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'token'],
        credentials: true
    };
}

app.use(cors(corsOptions));
// const port = process.env.PORT || 3000; // Se define más abajo

app.use(cookieParser());
app.use(bodyParser.json());

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));
app.use('/remissions', express.static('remissions'));

app.use('/api/projects', passport.authenticate('jwt', { session: false }), projectsRouter);
app.use('/api/remissions', passport.authenticate('jwt', { session: false }), remissionsRouter);
app.use('/api/menus', passport.authenticate('jwt', { session: false }), menusRouter); // Añadido
app.use('/api/temp', tempSeedRouter); // No requiere autenticación
app.use('/api/temp-truncate', tempTruncateRouter); // No requiere autenticación

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Usar el enrutador principal para todas las rutas de la API
app.use('/api', mainRouter);

// Middleware para manejar errores
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ message: 'Token inválido o no proporcionado' });
    }
    
    // Si el error tiene un código de estado, úsalo. Si no, es un error 500.
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Algo salió mal en el servidor';
    
    res.status(statusCode).json({ message });
});

const PORT = process.env.PORT || 3000;

// Solo iniciar el servidor si este archivo es ejecutado directamente
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
}

module.exports = app; // Exportar la app para las pruebas
