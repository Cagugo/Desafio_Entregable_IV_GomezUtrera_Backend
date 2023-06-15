const productsApi = require('../components/products');

const cartsApi = require('../components/carts');

const handlebarsApi = require('../components/handlebars');

module.exports = (app) => {
  handlebarsApi(app);

  productsApi(app);

  cartsApi(app);
};
