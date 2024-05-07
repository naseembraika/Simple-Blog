const { ObjectId } = require('mongodb');
const { dbConnection } = require('../configurations')
const { articleValidator } = require('../validators')

module.exports = class Article {
    static _collection = 'articles';

    constructor(articleData) {
        this.articleData = articleData;
    }

    save(callback) {
        dbConnection(Article._collection, async (collection) => {
            try {
                const result = await collection.insertOne(this.articleData);
                callback(null, result.insertedId);
            } catch (error) {
                callback(error)
            }
        })
    }

    static validate(articleData) {
        return articleValidator.validate(articleData);
    }

    static getArticle(query) {
        return new Promise((resolve, reject) => {
            dbConnection(Article._collection, async (collection) => {
                try {
                    const article = await collection.findOne(query);
                    resolve(article)
                } catch (error) {
                    reject(error);
                }
            })
        })
    }

    static getArticles(query, filter) {
        return new Promise((resolve, reject) => {
            dbConnection(Article._collection, async (collection) => {
                try {
                    const articles = await collection.find(query, filter).toArray();
                    resolve(articles);
                } catch (error) {
                    reject(error);
                }
            })
        })
    }

    static getAggregate(query) {
        return new Promise((resolve, reject) => {
            dbConnection(Article._collection, async (collection) => {
                try {
                    const data = await collection.aggregate(query).toArray();
                    if (!data) return resolve({ status: false });
                    resolve({ status: true, data })
                } catch (error) {
                    reject(error)
                }
            })
        })
    }

    static updateArticle(id, updatedData, callback) {
        dbConnection(Article._collection, async (collection) => {
            try {
                await collection.updateOne({ _id: new ObjectId(id) }, { '$set': updatedData });
                callback()
            } catch (error) {
                callback(error)
            }
        })
    }

    static deleteArticle(id) {
        return new Promise((resolve, reject) => {
            dbConnection(Article._collection, async (collection) => {
                try {
                    const article = await collection.findOneAndDelete({ _id: new ObjectId(id) });
                    resolve(article);
                } catch (error) {
                    reject(error)
                }
            })
        })
    }
}