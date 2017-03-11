var db = require('./db');
var mongo = require('mongodb');

function transformUser(user) {
    if (user) {
        user.id = user._id;
        delete user._id;
    }
    return user;
}

function save(user, cb) {
    db.collection('user').save(user, function (err1, writeResult) {
        db.collection('user').findOne(user, function (err2, saveUser) {
            cb(err1 || err2, saveUser);
        });
    });
}
module.exports.save = save;

function findAll(cb) {
    db.collection('user').find({}, function (err, cursor) {
        cursor.toArray(function (err, users) {
            cb(err, uses.map(transformUser));
        });
    });
}
module.exports.findAll = findAll;

function findByEmail(email, cb) {
    db.collection('user').findOne({email: email}, function (err, user) {
        cb(err, transformUser(user));
    });
}
module.exports.findByEmail = findByEmail;

function findById(sid, cb) {
    db.collection('user').findOne({'_id': new mongo.ObjectID(sid)}, function (err, user) {
        cb(err, transformUser(user));
    });
};
module.exports.findById = findById;

function updateDefaults(sid, newDefaults, cb) {
    findById(sid, function (err, user) {
        if (err) {
            cb(err);
        } else {
            newUser = {
                email: user.email,
                password: user.password,
                defaults: newDefaults,
                csrf: user.csrf
            };
            db.collection('user').update({'_id': new mongo.ObjectID(sid)}, {$set: newUser}, function (err, update) {
                findById(sid, cb);
            });
        }
    });
};
module.exports.updateDefaults = updateDefaults;

function updateCSRF(sid, newCSRF, cb) {
    findById(sid, function (err, user) {
        if (err) {
            cb(err);
        } else {
            newUser = {
                email: user.email,
                password: user.password,
                defaults: user.default,
                csrf: newCSRF
            };
            db.collection('user').update({'_id': new mongo.ObjectID(sid)}, {$set: newUser}, function (err, update) {
                findById(sid, cb);
            });
        }
    });
};
module.exports.updateCSRF = updateCSRF;

function saveDefaultUser() {
    var user = {
        email : 'samwise@mordor.org', password :'345345345', "defaults": {"colors": {"guessBackground":"#ffffff", "wordBackground": "#aaaaaa", "textColor": "#000000"},"level": {"name": "medium", "minLength": 4,"maxLength":10, "guesses": 7}, "font": {"url": "https://fonts.googleapis.com/css?family=Acme", "rule": "'Acme', Sans Serif", "family": "Acme", "category": "Sans Serif"
            } } };
/*,
        {
            'email' : 'frodo@mordor.org', 'password' :'234234234', "defaults": {
            "colors": {
                "guessBackground": "#ffffff",
                    "wordBackground": "#aaaaaa",
                    "textColor": "#000000"
            },
            "level": {
                "name": "medium",
                    "minLength": 4,
                    "maxLength": 10,
                    "guesses": 7
            },
            "font": {
                "url": "https://fonts.googleapis.com/css?family=Acme",
                    "rule": "'Acme', Sans Serif",
                    "family": "Acme",
                    "category": "Sans Serif"
            }
        }
        },
        {
            email : 'samwise@mordor.org', password :'345345345', "defaults": {
            "colors": {
                "guessBackground": "#ffffff",
                "wordBackground": "#aaaaaa",
                "textColor": "#000000"
            },
            "level": {
                "name": "medium",
                "minLength": 4,
                "maxLength": 10,
                "guesses": 7
            },
            "font": {
                "url": "https://fonts.googleapis.com/css?family=Acme",
                "rule": "'Acme', Sans Serif",
                "family": "Acme",
                "category": "Sans Serif"
            }
        }
        }
    }*/
    db.collection('user').insertOne()
}