const { auth } = require('../middlewares')
const dashboardRouter = require('./dashboard')
const authRouter = require('./auth')
const blogRouter = require('./blog')

module.exports = (app) => {
    app.use('/dashboard', auth, dashboardRouter)
    app.use('/auth', (req, res, next) => {
        if (req.cookies.token == undefined || req.cookies.token == '') return next()
        return res.redirect('/dashboard');
    }, authRouter)

    app.use('/', blogRouter)
}