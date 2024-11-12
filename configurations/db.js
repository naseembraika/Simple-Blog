const { MongoClient } = require('mongodb')

const _uri = process.env.DB_URI;

module.exports = (collection, cb) => {
    MongoClient.connect(_uri)
        .then(async (client) => {
            const db = client.db(process.env.DB_NAME).collection(collection);
            await cb(db);
            client.close();
        })
}