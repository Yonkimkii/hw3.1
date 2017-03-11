/**
 * Created by yonki on 3/3/17.
 */
var mongoClient = require('mongodb').MongoClient;
var db;

mongoClient.connect("mongodb://localhost:27017/wordgame", function (err, database) {
    if (err)
    {
        throw err;
    }
    db = database;
});

module.exports = {collection : (name) => db.collection(name)};
