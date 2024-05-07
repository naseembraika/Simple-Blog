const { ObjectId } = require('mongodb');
const { dbConnection } = require('../configurations')
const { hashSync, compareSync } = require('bcryptjs')
const { authorValidator } = require('../validators')

module.exports = class Author {
    static _collection = 'authors';

    constructor(authorData) {
        this.authorData = {
            name: authorData.name,
            username: authorData.username,
            password: hashSync(authorData.password),
            last_login: ''
        }
    }

    save(callback) {
        dbConnection(Author._collection, async (collection) => {
            try {
                await collection.insertOne(this.authorData);
                callback()
            } catch (error) {
                callback(error)
            }
        })
    }

    static isUsernameExist(username, callback) {
        dbConnection(Author._collection, async (collection) => {
            try {
                const exists = await collection.findOne({ username });
                (exists != undefined) ? callback(null, true) : callback(null, false);
            } catch (error) {
                callback(error)
            }
        })
    }

    static signupValidate(signupData) {
        return authorValidator.signup.validate(signupData);
    }

    static updateValidate(updateData) {
        return authorValidator.updateData.validate(updateData);
    }

    static login(loginData) {
        return new Promise((resolve, reject) => {
            dbConnection(Author._collection, async (collection) => {
                try {
                    let author = await collection.findOne({ username: loginData.username });
                    if (!author) return resolve({ status: false, message: 'check username' });
                    if (!compareSync(loginData.password, author.password)) return resolve({ status: false, message: "check password" });

                    await collection.updateOne({ _id: author._id }, { '$set': { 'last_login': new Date() } })
                    delete author.password;
                    resolve({ status: true, author });
                } catch (error) {
                    reject(error);
                }
            })
        })
    }

    static getAuthor(query) {
        return new Promise((resolve, reject) => {
            dbConnection(Author._collection, async (collection) => {
                try {
                    const author = await collection.findOne(query)
                    resolve(author);
                } catch (error) {
                    reject(error)
                }
            })
        })
    }

    static updateAuthor(id, updates, callback) {
        dbConnection(Author._collection, async (collection) => {
            try {
                await collection.updateOne({ _id: new ObjectId(id) }, { '$set': updates });
                callback();
            } catch (error) {
                callback(error)
            }
        })
    }

}