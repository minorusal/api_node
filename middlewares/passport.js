const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/usersModel');
const OwnerCompany = require('../models/ownerCompaniesModel');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;

// Configurar estrategia local para la autenticacion
passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    try {
        const { companyIdentifier } = req.body;
        if (!companyIdentifier) {
            return done(null, false, { message: 'El identificador de la compañía es requerido.' });
        }

        const company = await OwnerCompany.findByName(companyIdentifier);
        if (!company) {
            return done(null, false, { message: 'La compañía especificada no existe.' });
        }

        const user = await User.findByUsernameAndCompany(username, company.id);
        if (!user) {
            return done(null, false, { message: 'Correo electrónico incorrecto para esta compañía.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            user.owner_company_id = company.id;
            return done(null, user);
        }
        return done(null, false, { message: 'Contraseña incorrecta.' });
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
        if (user) {
            user.owner_company_id = jwtPayload.owner_company_id;
            return done(null, user);
        }
        return done(null, false);
    } catch (error) {
        return done(error, false);
    }
}));

module.exports = passport;
