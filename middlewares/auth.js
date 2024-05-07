const { verify } = require('jsonwebtoken')

module.exports = (req, res, next) => {
    let token = req.cookies.token;

    if (token == undefined || token == '') return res.status(403).redirect('/auth/login');

    token = token.split(' ')[1];
    try {
        const decodeToken = verify(token, process.env.JWT_SECRET_KEY);
        req.author = {
            _id: decodeToken._id,
            name: decodeToken.name,
            username: decodeToken.username
        }
        next();
    } catch (error) {
        next(createError(401, error.message))
    }
}