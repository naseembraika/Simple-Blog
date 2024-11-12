const express = require('express')
const middlewares = require('./middlewares')
const routes = require('./routes')
const app = express();
const createError = require('http-errors')

/**
 * Global Functions
 */
global.createError = createError;

/**
 * UnHandled Rejection
 */
process.on('unhandledRejection', (reason) => {
    console.log(reason);
    process.exit(1);
})

/**
 * Middlewares
 */
middlewares.global(app, express)

/**
 * Routes
 */
routes(app);

/**
 * Not Found Handler
 */
app.use((req, res, next) => {
    next(createError(404, "Page not found"))
})

/**
 * Global Error Handler
 */
app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        status: false,
        message: err.message
    })
})

module.exports = app;