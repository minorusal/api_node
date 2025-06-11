const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
require('./middlewares/passport');
const cors = require('cors');

const userRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const filesRouter = require('./routes/files');
const getApis = require('./routes/getApis');
const operaciones = require('./routes/operaciones')

const app = express();
app.use(cors({
    origin: 'http://minoru-aws-demo-s3.s3-website-us-east-1.amazonaws.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
const port = process.env.PORT || 3000;

app.use(cookieParser());

app.use(bodyParser.json());


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
    const headerToken = req.headers.authorization;
    if (!cookieToken) {
        return res.status(401).json({ message: 'Token no proporcionado en la cookie' });
    }
    if (!headerToken || !headerToken.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token no proporcionado en los headers de la solicitud' });
    }
    const token = headerToken.split(' ')[1];
    if (token !== cookieToken) {
        return res.status(401).json({ message: 'Tokens JWT no coinciden' });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido' });
        } else {
            next();
        }
    });
};

// Rutas protegidas
app.use('/', authenticateJWT, userRouter);

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
