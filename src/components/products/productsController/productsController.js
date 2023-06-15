
const express = require('express');

const fs = require('fs').promises;

const { v4: uuidv4 } = require('uuid');

class ProductRouter {
  constructor() {
    this.router = express.Router();
    this.productosFilePath = './src/data/productos.json';

    // Verificar y crear el archivo "productos.json" si no existe o está vacío
    this.initializeProductsFile();

    // Definir las rutas
    this.router.get('/', this.getAllProducts);
    this.router.get('/:pid', this.getProductById);
    this.router.post('/', this.addProduct);
    this.router.put('/:pid', this.updateProduct);
    this.router.delete('/:pid', this.deleteProduct);
  }

  // Verificar y crear el archivo "productos.json" si no existe o está vacío
  initializeProductsFile = async () => {
    try {
      // Verificar si el archivo existe
      await fs.access(this.productosFilePath);

      // Leer los datos del archivo
      const productosData = await fs.readFile(this.productosFilePath, 'utf8');

      // Verificar si el archivo está vacío
      if (productosData.trim() === '') {
        // Si está vacío, escribir un arreglo vacío en el archivo
        await fs.writeFile(this.productosFilePath, '[]');
      }
    } catch (error) {
      // Si el archivo no existe, crearlo y escribir un arreglo vacío
      await fs.writeFile(this.productosFilePath, '[]');
    }
  };

  // Obtener todos los productos
  getAllProducts = async (req, res) => {
    try {
      const limit = req.query.limit;

      // Leer los datos del archivo "productos.json"
      const productosData = await fs.readFile(this.productosFilePath, 'utf8');

      // Convertir los datos en un objeto JSON
      const products = JSON.parse(productosData);

      // Verificar si se especificó un límite
      const limitedProducts = limit ? products.slice(0, parseInt(limit)) : { status: 'success', payload: products };

      // Devolver los productos
      return res.status(200).json(limitedProducts);
    } catch (error) {
      // Devolver un error si ocurre algún problema al obtener los productos
      return res.status(500).json({ status: 'error', error: 'Error al obtener los productos' });
    }
  };

  // Obtener un producto por ID
  getProductById = async (req, res) => {
    try {
      const { pid } = req.params;

      // Leer los datos del archivo "productos.json"
      const productosData = await fs.readFile(this.productosFilePath, 'utf8');

      // Convertir los datos en un objeto JSON
      const products = JSON.parse(productosData);

      // Encontrar el producto con el ID especificado
      const product = products.find((p) => p.id === pid);

      // Verificar si el producto existe
      if (!product) {
        // Devolver un error si el producto no existe
        return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
      }

      // Devolver el producto
      return res.status(200).json({ status: 'success', payload: product });
    } catch (error) {
      // Devolver un error si ocurre algún problema al obtener el producto
      return res.status(500).json({ status: 'error', error: 'Error al obtener el producto' });
    }
  };

  // Agregar un nuevo producto
  addProduct = async (req, res) => {
    try {
      const { title, description, code, price, stock, category } = req.body;
      const images = req.files; // Obtener los archivos de imagen enviados

      // Verificar si faltan campos obligatorios
      if (!title || !description || !code || !price || !stock || !category) {
        // Devolver un error si faltan campos obligatorios
        return res.status(500).json({ status: 'error', error: 'Faltan campos obligatorios' });
      }

      // Leer los datos del archivo "productos.json"
      const productosData = await fs.readFile(this.productosFilePath, 'utf8');

      // Convertir los datos en un objeto JSON
      const products = JSON.parse(productosData);

      // Verificar si ya existe un producto con el mismo código
      const existingProduct = products.find((p) => p.code === code);

      // Si ya existe un producto con el mismo código, devolver un error
      if (existingProduct) {
        return res.status(400).json({ status: 'error', error: 'Ya existe un producto con el mismo código' });
      }

      // Generar un nuevo ID para el producto
      const newProductId = 'pid' + uuidv4().substring(0, 4);

      // Crear un nuevo objeto de producto
      const newProduct = {
        id: newProductId,
        title,
        description,
        code,
        price,
        status: true,
        stock,
        category,
        thumbnails: images && images.length > 0 ? images.map((image) => image.filename) : ['Sin imagen'],
      };

      // Agregar el nuevo producto al arreglo de productos
      products.push(newProduct);

      // Escribir los datos actualizados en el archivo "productos.json"
      await fs.writeFile(this.productosFilePath, JSON.stringify(products, null, 2));

      
      req.app.io.emit('newProduct', newProduct);

      // Devolver una respuesta exitosa con un mensaje de éxito
      return res.status(201).json({ status: 'success', message: 'Producto agregado correctamente' });
    } catch (error) {
      // Devolver un error si ocurre algún problema al agregar el producto
      return res.status(500).json({ status: 'error', error: 'Error al agregar el producto' });
    }
  };

  // Actualizar un producto
  updateProduct = async (req, res) => {
    try {
      const { pid } = req.params;
      const updateFields = req.body;

      // Verificar si se está intentando modificar el campo "id"
      if ('id' in updateFields) {
        // Devolver un error si se intenta modificar el campo "id"
        return res.status(400).json({ status: 'error', error: 'No se puede modificar el ID del producto' });
      }

      // Definir los campos permitidos para actualizar
      const allowedFields = ['title', 'description', 'code', 'price', 'stock', 'category'];

      // Filtrar los campos inválidos
      const invalidFields = Object.keys(updateFields).filter((field) => !allowedFields.includes(field));

      // Verificar si hay campos inválidos
      if (invalidFields.length > 0) {
        // Devolver un error con los campos inválidos
        return res.status(400).json({ status: 'error', error: `Los siguientes campos no se pueden modificar: ${invalidFields.join(', ')}` });
      }

      // Leer los datos del archivo "productos.json"
      const productosData = await fs.readFile(this.productosFilePath, 'utf8');

      // Convertir los datos en un objeto JSON
      const products = JSON.parse(productosData);

      // Encontrar el índice del producto a actualizar
      const productIndex = products.findIndex((p) => p.id === pid);

      // Verificar si el producto no se encontró
      if (productIndex === -1) {
        // Devolver un error si el producto no se encontró
        return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
      }

      // Obtener el producto a actualizar
      const product = products[productIndex];

      // Crear un objeto con los campos actualizados
      const updatedProduct = {
        ...product,
        ...updateFields,
      };

      // Reemplazar el producto anterior con el producto actualizado
      products[productIndex] = updatedProduct;

      // Escribir los datos actualizados en el archivo "productos.json"
      await fs.writeFile(this.productosFilePath, JSON.stringify(products, null, 2));

      // Devolver una respuesta exitosa
      return res.status(200).json({ status: 'success', message: 'Producto actualizado correctamente' });
    } catch (error) {
      // Devolver un error si ocurre algún problema al actualizar el producto
      return res.status(500).json({ status: 'error', error: 'Error al actualizar el producto' });
    }
  };

  // Eliminar un producto
  deleteProduct = async (req, res) => {
    try {
      const { pid } = req.params;

      // Leer los datos del archivo "productos.json"
      const productosData = await fs.readFile(this.productosFilePath, 'utf8');

      // Convertir los datos en un objeto JSON
      const products = JSON.parse(productosData);

      // Encontrar el índice del producto a eliminar
      const productIndex = products.findIndex((p) => p.id === pid);

      // Verificar si el producto no se encontró
      if (productIndex === -1) {
        // Devolver un error si el producto no se encontró
        return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
      }

      // Eliminar el producto del arreglo de productos
      products.splice(productIndex, 1);

      // Escribir los datos actualizados en el archivo "productos.json"
      await fs.writeFile(this.productosFilePath, JSON.stringify(products, null, 2));

      
      req.app.io.emit('deleteProduct', pid);

      // Devolver una respuesta exitosa
      return res.status(200).json({ status: 'success', message: 'Producto eliminado correctamente' });
    } catch (error) {
      // Devolver un error si ocurre algún problema al eliminar el producto
      return res.status(500).json({ status: 'error', error: 'Error al eliminar el producto' });
    }
  };
}

module.exports = new ProductRouter();
