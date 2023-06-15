// Importar el módulo de enrutador de Express
const { Router } = require('express');

// Importar el controlador de handlebars
const handlebarsController = require('./handlebarsController/handlebarsController');

const router = Router();

// Definir las rutas y asignar los controladores correspondientes
router.get('/', handlebarsController.getHome);
router.get('/realTimeProducts', handlebarsController.getRealTimeProducts);

module.exports = (app) => {
  app.use(router);
};
