
const express = require('express');
const fs = require('fs');
const path = require('path');

const productosFilePath = path.join(__dirname, '../../../data/productos.json');

class HandlebarsRouter {
  constructor() {
    this.router = express.Router();
    this.router.get('/', this.getHome);
    this.router.get('/realtimeproducts', this.getRealTimeProducts);
  }

  getHome = async (req, res) => {
    try {
      if (!fs.existsSync(productosFilePath)) {
  
        return res.status(404).json({ status: 'error', error: 'Archivo productos.json no encontrado' });
      }

      const productosData = require(productosFilePath);

      const productos = productosData.map((producto) => ({
        id: producto.id,
        title: producto.title,
        description: producto.description,
        code: producto.code,
        price: producto.price,
        stock: producto.stock,
        category: producto.category,
      }));

      return res.status(200).render('home', { productos, style: 'index.css' });
    } catch (error) {
      return res.status(500).json({ status: 'error', error: 'Error Handlebars' });
    }
  };

  getRealTimeProducts = async (req, res) => {
    try {
      if (!fs.existsSync(productosFilePath)) {
       
        return res.status(404).json({ status: 'error', error: 'Archivo productos.json no encontrado' });
      }

      const productosData = require(productosFilePath);

      const productos = productosData.map((producto) => ({
        id: producto.id,
        title: producto.title,
        description: producto.description,
        code: producto.code,
        price: producto.price,
        stock: producto.stock,
        category: producto.category,
      }));

      return res.status(200).render('realTimeProducts', { productos, style: 'index.css' });
    } catch (error) {
      
      return res.status(500).json({ status: 'error', error: 'Error Handlebars' });
    }
  };
}

module.exports = new HandlebarsRouter();
