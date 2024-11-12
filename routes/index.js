const articlesRouter = require('./articles')

module.exports = (app) => {
    app.get('/', (req, res, next) => {
        res.status(200).redirect('/articles');
    })
    app.use('/articles', articlesRouter)
}