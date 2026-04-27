#!/usr/bin/env node

var app = require('../src/app');
var debug = require('debug')('todo-task-backend:server');
var http = require('http');
const {connectToDB} = require('../src/config/MongoDBContext');

async function start() {
    try {
        await connectToDB();

        var port = normalizePort(process.env.PORT || '`3000`');
        app.set('port', port);

        var server = http.createServer(app);
        server.listen(port);

        server.on('error', (error) => onError(error, port)); // Передаємо порт для логів
        server.on('listening', () => {
            var addr = server.address();
            var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
            console.log('Listening on ' + bind);
            debug('Listening on ' + bind);
        });

    } catch (err) {
        console.error('Failed to start the application:', err);
        process.exit(1);
    }
}

start();

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }

    return false;
}

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
