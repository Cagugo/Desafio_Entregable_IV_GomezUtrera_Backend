
const express = require('express');

const fs = require('fs').promises;

const { v4: uuidv4 } = require('uuid');

class CartsRouter {
  constructor() {
    this.router = express.Router();

    this.carritoFilePath = './src/data/carrito.json';
    this.productsFilePath = './src/data/productos.json';

    this.initializeCarritoFile();

    this.router.post('/', this.addCart);
    this.router.get('/:cid', this.getCartById);
    this.router.post('/:cid/product/:pid', this.addProductToCart);
    this.router.delete('/:cid/product/:pid', this.deleteProductToCart);
    this.router.delete('/:cid', this.deleteCart);
  }

  initializeCarritoFile = async () => {
    try {
      await fs.access(this.carritoFilePath);

      const carritoData = await fs.readFile(this.carritoFilePath, 'utf8');
      if (carritoData.trim() === '') {
        await fs.writeFile(this.carritoFilePath, '[]');
      }
    } catch (error) {
      await fs.writeFile(this.carritoFilePath, '[]');
    }
  };

  addCart = async (req, res) => {
    try {
      const cartsData = await fs.readFile(this.carritoFilePath, 'utf8');
      const carts = JSON.parse(cartsData);

      const newCartId = 'cid' + uuidv4().substring(0, 4);

      const newCart = {
        id: newCartId,
        products: [],
      };

      carts.push(newCart);

      await fs.writeFile(this.carritoFilePath, JSON.stringify(carts, null, 2));

      return res.status(201).json({ status: 'created', message: 'Nuevo carrito creado', cart: newCart });
    } catch (error) {
      return res.status(500).json({ status: 'error', error: 'Error al crear el carrito' });
    }
  };

  getCartById = async (req, res) => {
    try {
      const { cid } = req.params;

      const cartsData = await fs.readFile(this.carritoFilePath, 'utf8');
      const carts = JSON.parse(cartsData);

      const cart = carts.find((c) => c.id === cid);

      if (!cart) {
        return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
      }

      return res.status(200).json({ status: 'success', payload: cart.products });
    } catch (error) {

      return res.status(500).json({ status: 'error', error: 'Error al obtener los productos del carrito' });
    }
  };

  addProductToCart = async (req, res) => {
    try {
      const { cid, pid } = req.params;
      
      const { quantity } = req.body;

      const cartsData = await fs.readFile(this.carritoFilePath, 'utf8');
      const carts = JSON.parse(cartsData);

      const cartIndex = carts.findIndex((c) => c.id === cid);

      if (cartIndex === -1) {

        return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
      }

      const cart = carts[cartIndex];

      const productsData = await fs.readFile(this.productsFilePath, 'utf8');
      const products = JSON.parse(productsData);

      const product = products.find((p) => p.id === pid);

      if (!product) {
        return res.status(404).json({ status: 'error', error: 'ID de Producto no encontrado. Debe ingresar el ID de un producto existente en el archivo productos.json' });
      }

      const productIndex = cart.products.findIndex((p) => p.productId === pid);

      if (productIndex === -1) {
        const newProduct = {
          productId: pid,
          quantity: quantity || 1,
        };

        cart.products.push(newProduct);
      } else {

        cart.products[productIndex].quantity += quantity || 1;
      }

      carts[cartIndex] = cart;

      await fs.writeFile(this.carritoFilePath, JSON.stringify(carts, null, 2));

      return res.status(200).json({ status: 'success', message: 'Producto agregado al carrito correctamente' });
    } catch (error) {

      return res.status(500).json({ status: 'error', error: 'Error al agregar el producto al carrito' });
    }
  };

  deleteProductToCart = async (req, res) => {
    try {
      const { cid, pid } = req.params;

      const cartsData = await fs.readFile(this.carritoFilePath, 'utf8');
      
      const carts = JSON.parse(cartsData);

      const cartIndex = carts.findIndex((c) => c.id === cid);

      if (cartIndex === -1) {
        return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
      }

      const cart = carts[cartIndex];

      const productIndex = cart.products.findIndex((p) => p.productId === pid);

      if (productIndex === -1) {
        return res.status(404).json({ status: 'error', error: 'Producto no encontrado en el carrito' });
      }

      cart.products.splice(productIndex, 1);

      carts[cartIndex] = cart;

      await fs.writeFile(this.carritoFilePath, JSON.stringify(carts, null, 2));

      return res.status(200).json({ status: 'success', message: 'Producto eliminado del carrito correctamente' });
    } catch (error) {
      return res.status(500).json({ status: 'error', error: 'Error al eliminar el producto del carrito' });
    }
  };

  deleteCart = async (req, res) => {
    try {
      const { cid } = req.params;

      const cartsData = await fs.readFile(this.carritoFilePath, 'utf8');
      const carts = JSON.parse(cartsData);

      const cartIndex = carts.findIndex((c) => c.id === cid);

      if (cartIndex === -1) {
        return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
      }

      carts.splice(cartIndex, 1);

      await fs.writeFile(this.carritoFilePath, JSON.stringify(carts, null, 2));

      return res.status(200).json({ status: 'success', message: 'Carrito eliminado correctamente' });
    } catch (error) {
      return res.status(500).json({ status: 'error', error: 'Error al eliminar el carrito' });
    }
  };
}

module.exports = new CartsRouter();
