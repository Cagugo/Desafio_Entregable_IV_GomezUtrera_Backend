const express = require('express');

const path = require('path');

const expressHandlebars = require('express-handlebars');

const socketIO = require('socket.io');

const routes = require('./routes');

const PORT = 8080;

class Server {
  constructor() {
    this.app = express();

    this.settings();

    this.routes();

    this.socket();
  }

  settings() {
    this.app.use(express.json());

    this.app.use(
      express.urlencoded({
        extended: true,
      })
    );

    const handlebars = expressHandlebars.create({
      defaultLayout: 'main',
    });

    // Establecer la ruta de las vistas como la carpeta 'views'
    this.app.set('views', path.join(__dirname, 'views'));
    this.app.engine('handlebars', handlebars.engine);
    this.app.set('view engine', 'handlebars');

    // Establecer de manera estática la carpeta 'public'
    this.app.use(express.static(path.join(__dirname, '/public')));
  }

  routes() {
    routes(this.app);
  }

  socket() {
    const server = require('http').createServer(this.app);
    const io = socketIO(server);

    io.on('connection', (socket) => {
      console.log('Cliente conectado');

      socket.on('newProduct', (product) => {
        io.emit('newProduct', product);
      });

      socket.on('deleteProduct', (id) => {
        io.emit('deleteProduct', id);
      });

      socket.on('disconnect', () => {
        console.log('Cliente desconectado');
      });
    });

    this.app.io = io;
  }

  
  listen() {
    const server = this.app.listen(PORT, () => {
      console.log(`Servidor en http://localhost:${PORT}`);
    });

    this.app.io.attach(server);
  }
}

module.exports = new Server();
