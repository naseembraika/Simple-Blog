const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const methodOverride = require('method-override')

module.exports = {
    global: function (app, express) {
        app.use(cookieParser())
        app.use(express.json())
        app.use(express.static('public'))
        app.use(methodOverride('_method'))
        app.use(express.urlencoded({ extended: true }))
        app.use(bodyParser.urlencoded({ extended: false }))
        app.set('view engine', 'ejs');
    },
    auth: require('./auth')
}