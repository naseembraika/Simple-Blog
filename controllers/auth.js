const { Author } = require('../models')
const { sign, verify } = require('jsonwebtoken')
const { hashSync } = require('bcryptjs');
const { ObjectId } = require('mongodb');

const renderLoginPage = (req, res, next) => {
    res.render('auth/login');
}

const renderSignupPage = (req, res, next) => {
    res.render('auth/signup', { signupData: {} })
}

const renderForgotPassword = (req, res, next) => {
    res.render('auth/forgot-password')
}

const renderResetPassword = (req, res, next) => {
    try {
        const token = req.params.token;
        const decodeToken = verify(token, process.env.JWT_SECRET_KEY);
        Author.getAuthor({ _id: new ObjectId(decodeToken.id) })
            .then(author => {
                if (!author) return res.status(404).json({status: false, message: "user not found", statusCode: 404})
                if (author.password != decodeToken.password) return res.status(403).json({status: false, message: "Forbidden", statusCode: 403})
                res.status(200).render('auth/reset-password', { token });
            })
            .catch(error => next(createError(500, error.message)));
    } catch (error) {
        res.status(403).render('auth/login');
    }
}

const signup = (req, res, next) => {
    const signupData = req.body;

    // const validation = Author.validate('signup', signupData);
    const validation = Author.signupValidate(signupData);
    if (validation.error) return res.render('auth/signup', { signupData, message: validation.error.message });

    Author.isUsernameExist(signupData.username, (error, status) => {
        if (error) return next(createError(500, error.message));
        if (status) return res.render('auth/signup', { signupData, message: 'username already used' });
        const author = new Author(signupData);
        author.save((error) => {
            if (error) return next(createError(500, error.message))
            res.status(201).redirect('/auth/login')
        })
    })
}

const login = async (req, res, next) => {
    const loginData = req.body;

    try {
        const result = await Author.login(loginData);
        if (!result.status) return res.status(400).render('auth/login', { message: result.message });
        const token = sign(result.author, process.env.JWT_SECRET_KEY);
        res.cookie('token', `Bearer ${token}`, { httpOnly: true });
        res.redirect('/dashboard')
    } catch (error) {
        next(createError(500, error.message))
    }
}

const forgotPassword = async (req, res, next) => {
    try {
        const author = await Author.getAuthor({ email: req.body.email });
        if (!author) return res.status(404).render('auth/forgot-password', { message: "Email not found" });

        const token = sign({ id: author._id, password: author.password }, process.env.JWT_SECRET_KEY, { expiresIn: '10m' });
        const urlReset = `http://localhost:5000/auth/reset/${token}`;
        res.status(200).json({
            status: true,
            urlReset
        })
    } catch (error) {
        next(createError(500, error.message))
    }
}

const resetPassword = (req, res, next) => {
    try {
        const token = req.params.token;
        const decodeToken = verify(token, process.env.JWT_SECRET_KEY);
        Author.getAuthor({_id: new ObjectId(decodeToken.id)})
            .then(author => {
                if (!author) return res.status(404).json({status: false, message: "user not found", statusCode: 404})
                if (author.password != decodeToken.password) return res.status(403).json({status: false, message: "Forbidden", statusCode: 403})
                const newPassword = hashSync(req.body.password);

                Author.updateAuthor(author._id.toString(), {password: newPassword}, (error) => {
                    if (error) next(createError(500, error.message));
                    res.status(200).redirect('/auth/login');
                })
            })
            .catch(error => next(createError(500, error.message)))
    } catch (error) {
        res.status(403).redirect('/auth/login')
    }
}

module.exports = {
    renderLoginPage,
    renderSignupPage,
    renderForgotPassword,
    renderResetPassword,
    signup,
    login,
    forgotPassword,
    resetPassword
}