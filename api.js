const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
require('./middlewares/passport');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const userRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const filesRouter = require('./routes/files');
const getApis = require('./routes/getApis');
const operaciones = require('./routes/operaciones')
const materialsRouter = require('./routes/materials');
const accessoriesRouter = require('./routes/accessories');
const playsetsRouter = require('./routes/playsets');
const playsetAccessoriesRouter = require('./routes/playsetAccessories');
const materialAttributesRouter = require('./routes/materialAttributes');
const accessoryMaterialsRouter = require('./routes/accessoryMaterials');
const accessoryComponentsRouter = require('./routes/accessoryComponents');
const clientsRouter = require('./routes/clients');
const projectsRouter = require('./routes/projects');
const installationCostsRouter = require('./routes/installationCosts');
const ownerCompaniesRouter = require('./routes/ownerCompanies');
const remissionStyleRouter = require('./routes/remissionStyle');
const remissionsRouter = require('./routes/remissions');
const menusRouter = require('./routes/menus');
const materialTypesRouter = require('./routes/materialTypes');

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
const port = process.env.PORT || 3000;

app.use(cookieParser());

app.use(bodyParser.json());

// Serve uploaded files so templates can access logos
app.use('/uploads', express.static('uploads'));
// Serve generated remission PDFs
app.use('/remissions', express.static('remissions'));

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Rutas de autentcacion
app.use('/auth', authRouter);

// Rutas de archivos
app.use('/files', filesRouter);

// Rutas de public apis
app.use('/public-apis', getApis);

// Rutas de suma
app.use('/operaciones', operaciones);

// Middleware para la autenticacion de passport
const authenticateJWT = (req, res, next) => {
    const cookieToken = req.cookies.jwt;
    const headerToken = req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null;

    const token = headerToken || cookieToken;

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    if (headerToken && cookieToken && headerToken !== cookieToken) {
        return res.status(401).json({ message: 'Tokens JWT no coinciden' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido' });
        }
        next();
    });
};

// Rutas protegidas
app.use('/', authenticateJWT, userRouter);
app.use('/', authenticateJWT, materialsRouter);
app.use('/', authenticateJWT, accessoryMaterialsRouter);
app.use('/', authenticateJWT, accessoryComponentsRouter);
app.use('/', authenticateJWT, accessoriesRouter);
app.use('/', authenticateJWT, playsetsRouter);
app.use('/', authenticateJWT, playsetAccessoriesRouter);
app.use('/', authenticateJWT, materialAttributesRouter);
app.use('/', authenticateJWT, materialTypesRouter);
app.use('/', authenticateJWT, clientsRouter);
app.use('/', authenticateJWT, projectsRouter);
app.use('/', authenticateJWT, installationCostsRouter);
app.use('/', authenticateJWT, ownerCompaniesRouter);
app.use('/', authenticateJWT, remissionStyleRouter);
app.use('/', authenticateJWT, remissionsRouter);
app.use('/', authenticateJWT, menusRouter);

// Middleware para manejar errores
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ message: 'Token inválido o no proporcionado' });
    }
    console.error(err.stack);
    res.status(500).send('Algo salió mal en el servidor');
});

app.listen(port, () => {
    console.log(`Aplicación levantada en el puerto: ${port}`);
});
