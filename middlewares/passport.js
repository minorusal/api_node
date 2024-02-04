const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/usersModel');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;

// Configurar estrategia local para la autenticacion
passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        console.log(username);
        const user = await User.findOne({ username });
        if (!user) {
            return done(null, false, { message: 'Nombre de usuario incorrecto' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            return done(null, user);
        } else {
            return done(null, false, { message: 'Contraseña incorrecta' });
        }
    } catch (error) {
        return done(error);
    }
}));

// Configurar estrategia JWT para la autenticacion
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = jwtSecret;

passport.use(new JwtStrategy(opts, async (jwtPayload, done) => {
    try {
        const user = await User.findById(jwtPayload.sub);
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    } catch (error) {
        return done(error, false);
    }
}));

module.exports = passport;
