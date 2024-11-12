const methodOverride = require('method-override')
const cookieParser = require('cookie-parser')

module.exports = {
    global: function (app, express) {
        app.use(express.json())
        app.use(express.urlencoded({ extended: true }))
        app.use(express.static('public'))
        app.use(methodOverride('_method'))
        app.use(cookieParser())
        app.set('view engine', 'ejs')
    }
}