const express = require('express');
const userRouter = require('./users');
const authRouter = require('./auth');
const filesRouter = require('./files');
const getApis = require('./getApis');
const operaciones = require('./operaciones');
const materialsRouter = require('./materials');
const accessoriesRouter = require('./accessories');
const playsetsRouter = require('./playsets');
const playsetAccessoriesRouter = require('./playsetAccessories');
const materialAttributesRouter = require('./materialAttributes');
const accessoryMaterialsRouter = require('./accessoryMaterials');
const accessoryComponentsRouter = require('./accessoryComponents');
const clientsRouter = require('./clients');
const projectsRouter = require('./projects');
const installationCostsRouter = require('./installationCosts');
const ownerCompaniesRouter = require('./ownerCompanies');
const remissionStyleRouter = require('./remissionStyle');
const remissionsRouter = require('./remissions');
const menusRouter = require('./menus');
const materialTypesRouter = require('./materialTypes');
const passport = require('passport');

const router = express.Router();

// Rutas públicas
router.use('/auth', authRouter);
router.use('/public-apis', getApis);

// Rutas de prueba/operaciones (pueden o no requerir autenticación)
router.use('/operaciones', operaciones);

// Todas las rutas de aquí en adelante requerirán autenticación
router.use(passport.authenticate('jwt', { session: false }));

// Rutas protegidas
router.use('/users', userRouter);
router.use('/files', filesRouter);
router.use('/materials', materialsRouter);
router.use('/accessories', accessoriesRouter);
router.use('/playsets', playsetsRouter);
router.use('/playset-accessories', playsetAccessoriesRouter);
router.use('/material-attributes', materialAttributesRouter);
router.use('/accessory-materials', accessoryMaterialsRouter);
router.use('/accessory-components', accessoryComponentsRouter);
router.use('/clients', clientsRouter);
router.use('/projects', projectsRouter);
router.use('/installation-costs', installationCostsRouter);
router.use('/owner-companies', ownerCompaniesRouter);
router.use('/remission-style', remissionStyleRouter);
router.use('/remissions', remissionsRouter);
router.use('/menus', menusRouter);
router.use('/material-types', materialTypesRouter);

module.exports = router; 