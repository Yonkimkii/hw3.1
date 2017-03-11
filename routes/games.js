/**
 * Created by yonki on 3/3/17.
 */
var db = require('./db');
var mongo = require('mongodb');
var game = require('./gameModel');

function transformGame(game) {
    if(game)
    {
        game.id = game._id;
        delete game._id;
    }
    return game;
}

function create(userId, colors, font, level, target, view, cb) {
    var result = new game(userId, colors, font, level, target, view);
    db.collection('game').insertOne(result, function (err, result) {
        if(err)
        {
            console.log('err', err);
        } else {
            cb(err, transformGame(result.ops[0]));
        }
    });
    return result;
}
module.exports.create = create;

function findByUserId(userId, cb) {
    db.collection('game').find({userId : userId}).toArray( function (err, games) {
            console.log('get_game_mongo', games);
            cb(err, games.map(transformGame));
        });
};
module.exports.findByUserId = findByUserId;

function update(userId, gid, newGame, cb) {
    find(userId, gid, function (err, game) {
        if(err)
        {
            cb(err);
        } else
        {
            console.log('mongo_newgame', newGame);
            console.log('mongo_game', game);
            /*newGame = {
                userId : game.userId,
                colors : newGame.colors || game.colors,
                fonts : newGame.fonts || game.fonts,
                level : game.level,
                remaining : newGame.remaining || game.remaining,
                status : newGame.status || game.status,
                timestamp : game.timeStamp,
                timeToComplete : newGame.timeToComplete || game.timeToComplete,
                view : newGame.view || game.view,
                meta : game.meta
            };*/
            console.log('mongo_newerGame', newGame);
            db.collection('game').update({'_id' : new mongo.ObjectID(gid)}, {$set : newGame}, function (err1, update) {
                find(userId, gid, cb);
            });
        }
    });
}
module.exports.update = update;

function find(userId, gid, cb) {
    db.collection('game').find({userId : userId, '_id' : new mongo.ObjectID(gid)}, function (err, cursor) {
        cursor.toArray(function (err, games) {
            cb(err, games.map(transformGame));
        });
    });
}
module.exports.find = find;

function findFont(font, cb) {
    db.collection('meta').findOne({family : font}, function (err, fonts) {
        cb(err, fonts);
    });
};
module.exports.findFont = findFont;