const { Author } = require('../models')
const { rmSync, existsSync, mkdirSync, copyFileSync } = require('fs')
const { join } = require('path')
const { sign } = require('jsonwebtoken')
const { ObjectId } = require('mongodb')

const updateAuthorData = (req, res, next) => {
    let updatedData = req.body;

    const validation = Author.updateValidate(updatedData);
    if (validation.error) {
        if (req.file) rmSync(join('public', 'uploads', req.file.filename));
        return res.status(400).render('dashboard/admins/edit_profile', { author: updatedData, message: validation.error.message });
    }

    Author.isUsernameExist(updatedData.username, (error, status) => {
        if (error) return next(createError(500, error.message));
        if (status && (updatedData.username != req.author.username)) {
            return res.status(409).render('dashboard/admins/edit_profile', { author: updatedData, message: 'username is used' })
        }

        if (req.file) {
            updatedData.cover_profile_name = req.file.filename;
            if (!existsSync(join('public', 'uploads', req.author._id.toString()))) {
                mkdirSync(join('public', 'uploads', req.author._id.toString()))
            }
            copyFileSync(join('public', 'uploads', req.file.filename), join('public', 'uploads', req.author._id.toString(), req.file.filename));
            rmSync(join('public', 'uploads', req.file.filename));
        }

        Author.getAuthor({_id: new ObjectId(req.author._id.toString())})
            .then(author => {
                if (author.cover_profile_name && req.file) {
                    rmSync(join('public', 'uploads', author._id.toString(), author.cover_profile_name));
                }
                Author.updateAuthor(req.author._id.toString(), updatedData, (error) => {
                    if (error) return next(createError(500, error.message));
                    const newToken = sign({ _id: req.author._id.toString(), name: updatedData.name, username: updatedData.username }, process.env.JWT_SECRET_KEY);
                    res.cookie('token', `Bearer ${newToken}`, { httpOnly: true });
                    res.redirect('/dashboard');
                })
            })
            .catch(error => next(createError(500, error.message)))

    })
}

const getAuthorById = async (_id) => {
    return await Author.getAuthor({_id});
}

module.exports = {
    updateAuthorData,
    getAuthorById
}