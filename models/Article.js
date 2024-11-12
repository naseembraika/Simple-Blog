const { dbConnection } = require('../configurations')
const { articleValidate } = require('../validators')

module.exports = class Article {
    static _collection = 'articles';

    constructor(articleData) {
        this.articleData = articleData;
    }

    save(cb) {
        dbConnection(Article._collection, async (collection) => {
            try {
                await collection.insertOne(this.articleData);
                cb();
            } catch (error) {
                cb({ status: false, error })
            }
        })
    }

    static isExists(filter, options) {
        return new Promise((resolve, reject) => {
            dbConnection(Article._collection, async (collection) => {
                try {
                    const data = await collection.findOne(filter, options);
                    return (data) ? resolve({ status: true }) : resolve({ status: false });
                } catch (error) {

                }
            })
        })
    }

    static validate(articleData) {
        return articleValidate.validate(articleData);
    }

    static findOne(filter, options) {
        return new Promise((resolve, reject) => {
            dbConnection(Article._collection, async (collection) => {
                try {
                    const article = await collection.findOne(filter, options);
                    return (article) ? resolve({ status: true, data: article }) : resolve({ status: false });
                } catch (error) {
                    reject(error);
                }
            })
        })
    }

    static find(filter, options) {
        return new Promise((resolve, reject) => {
            dbConnection(Article._collection, async (collection) => {
                try {
                    const articles = await collection.find(filter, options).toArray();
                    return (articles) ? resolve({ status: true, data: articles }) : resolve({ status: false });
                } catch (error) {
                    reject(error);
                }
            })
        })
    }

    static updateOne(filter, update, options, cb) {
        dbConnection(Article._collection, async (collection) => {
            try {
                await collection.updateOne(filter, update, options);
                cb();
            } catch (error) {
                cb(error)
            }
        })
    }

    static deleteOne(filter, options, cb) {
        dbConnection(Article._collection, async (collection) => {
            try {
                await collection.deleteOne(filter, options);
                cb();
            } catch (error) {
                cb(error);
            }
        })
    }

}