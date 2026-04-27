const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
require('dotenv').config();
const cors = require('cors');



const app = express();

app.use(logger('dev'));
app.use(express.json());

app.use(express.urlencoded({extended: false}));

// Setting CORS
app.use(cors({
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

// Swagger config
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Todo Task API',
            version: '1.0.0',
            description: 'Документація мого Todo бекенду',
        },
        servers: [{url: `http://localhost:${process.env.PORT || 3000}`}],
    },
    apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Connect router to app
const taskRouter = require('./routes/task_route');
app.use('/tasks', taskRouter);


app.use(function (req, res, next) {
    next(createError(404));
});


// Error handling
app.use(function (err, req, res, next) {
    const status = err.status || 500;
    res.status(status).json({
        message: err.message,
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

module.exports = app;