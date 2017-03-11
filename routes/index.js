var express = require('express');
var fs = require("fs");
var router = express.Router();
var User = require('./users');
var Game = require('./games');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
    readDictionary();
});

module.exports = router;

function readDictionary() {
    fs.readFile('routes/wordlist.txt', 'utf8', function (err, data) {
        if (err) {
            throw err;
        }
        var wordlist = data.split('\r\n');
        var i;
        var name, length;
        for (i = 0; i < wordlist.length; i++) {
            name = wordlist[i];
            length = wordlist[i].length;
            dictionary.word.push({'name': name, 'length': length});
        }
    });
}

function setTarget(level) {
    console.log('level', level);
    var minLength = level.minLength;
    console.log('minLength', minLength);
    var maxLength = level.maxLength;
    console.log('maxLength', maxLength);
    var length = Math.floor(Math.random() * maxLength + minLength);
    console.log('length', length);
    var target = dictionary.word[length];
    console.log('target', target);
    return target;
}

function getMeta(userid) {
    User.findById(userid, function (err, user) {
        var meta = user.default;
        return meta;
    });
}

var dictionary = {
    word: []
};
/******************************************Routes**********************************************/
router.get('/wordGame', function (req, res) {
    readDictionary();
    res.sendfile('index.html', {root: _dirname + "/../public"});
});

router.post('/wordgame/api/v2/login', function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var csrf = req.get('X-csrf');
    console.log('req.get()', csrf);
    console.log('csrf index', csrf);
    req.session.regenerate(function (err_session) {
        User.findByEmail(email, function (err_mongo, user) {
            if (user && user.password == password) {
                req.session.user = user;
                req.session['X-csrf'] = csrf;
                console.log('req.session/csrf', req.session['X-csrf']);
                delete user.password;
                res.setHeader('X-csrf', csrf);
                readDictionary();
                res.json(user);
            } else {
                res.status(403).send('Error with username/password or status');
            }
        });
    });
    console.log('body', req.body);
    console.log('email', req.body.email);
    console.log('password', req.body.password);
});

router.post('/wordgame/api/v2/logout', function (req, res) {
    req.session.regenerate(function (err) {
        res.json({msg: 'ok'});
    });
});

router.get('/wordgame/api/v2', function (req, res) {
    var user = req.session.user;
    if (user) {
        res.json(user);
    } else {
        res.status(403).send('Forbidden');
    }
});

router.get('/wordGame/api/v2/meta', function (req, res) {
    res.json(meta);
});

router.get('/wordGame/api/v2/meta/fonts', function (req, res) {
    var fonts = meta.fonts || {msg: 'no font'};
    res.send(fonts);
});

router.all('/wordgame/api/v2/:userid/*', function (req, res, next) {
    User.findById(req.params.userid, function (error, pathUser) {
        var authenticatedUser = req.session.user;
        var csrf = req.session['X-csrf'];
        console.log('req,session.all', csrf);
        console.log('check csrf', csrf);
        console.log('req.get.csrf', req.get('X-csrf'));
        if (authenticatedUser && pathUser && authenticatedUser.id == pathUser.id && csrf == req.get('X-csrf')) {
            next();
        } else {
            res.redirect('/');
        }
    });
});

router.get('/wordGame/api/v2/:userid', function (req, res) {
    Game.findByUserId(req.params.userid, function(err1, games){
        console.log('get_games', games);
        if (err1) {
            res.json({msg: err1});
        } else {
            res.json(games);
        }
    });
});

router.post('/wordGame/api/v2/:userid', function (req, res) {
    var url = req.body.url;
    var rule = req.body.rule;
    var family = req.body.family;
    var category = req.body.category;
    var font = {
        url: url,
        rule: rule,
        family: family,
        category: category
    };
    var name = req.body.name;
    var minLength = req.body.minLength;
    var maxLength = req.body.maxLength;
    var guesses = req.body.guesses;
    var level = {
        name: name,
        minLength: minLength,
        maxLength: maxLength,
        guesses: guesses
    };
    var wordBackground = req.body.wordBackground;
    var textBackground = req.body.textBackground;
    var guessBackground = req.body.guessBackground;
    var colors = {
        wordBackground: wordBackground,
        textBackground: textBackground,
        guessBackground: guessBackground
    };
    var target = setTarget(level);
    var view = new Array();
    for (var i = 0; i < target.length; i++) {
        view.push('_');
    }
    Game.create(req.params.userid, colors, font, level, target, view, (err, newGame) => {
        if (err) {
            throw err;
        } else {
            console.log('game', newGame);
            res.json(newGame);
        }
    });
});

router.put('/wordgame/api/v2/:userid/defaults', function (req, res) {
    console.log('req.body', req.body);
    var url = req.body.url;
    var rule = req.body.rule;
    var family = req.body.family;
    var category = req.body.category;
    var font = {
        url: url,
        rule: rule,
        family: family,
        category: category
    };
    var name = req.body.name;
    var minLength = req.body.minLength;
    var maxLength = req.body.maxLength;
    var guesses = req.body.guesses;
    var level = {
        name: name,
        minLength: minLength,
        maxLength: maxLength,
        guesses: guesses
    };
    var wordBackground = req.body.wordBackground;
    var textBackground = req.body.textBackground;
    var guessBackground = req.body.guessBackground;
    var colors = {
        wordBackground: wordBackground,
        textBackground: textBackground,
        guessBackground: guessBackground
    };
    var defaults = {
        level: level,
        font: font,
        colors: colors
    };
    console.log('defaults', defaults);
    User.updateDefaults(req.params.userid, defaults, function (err, user) {
        if (err) {
            res.json({msg: err});
        } else {
            res.json({user: user});
        }
    });
});

router.get('/api/v2/:userid/:gid', function (req, res) {
    User.findById(req.params.userid, function(err, user){
        if (err || !user) {
            res.json({msg: err});
        } else {
            Game.find(user.id, req.params.gid, function(err1, game) {
                if (err1 || !game) {
                    res.json({msg: err1});
                } else {
                    res.json({game: game});
                }
            });
        }
    });
});

router.post('/wordgame/api/v2/:userid/:gid/guesses', function (req, res) {
    console.log('guess req.body', req.body);
    console.log('guess_req.params.userid', req.params.userid);
    console.log('guess_req.params.gid', req.params.gid);
    Game.find(req.params.userid, req.params.gid, function(err, oldgame){
        if (err) {
            res.json({msg: err});
        } else {
            console.log('oldgame', oldgame);
            var game = oldgame[0];
            console.log('guess game', game);
            var guess = req.body.guess;
            console.log('guess', guess);
            if (game.target.indexOf(guess) >= 0) {
                for (var i = 0; i < game.target.length; i++) {
                    if (game.target.charAt(i) == guess) {
                        game.view[i] = guess;
                    }
                }
            }
            game.remaining = game.remaining - 1;
            if (game.view.filter((c) => c == '_').length <= 0) {
                game.status = 'victory';
            }
            if (game.remaining < 1 && game.view.filter((c) => c == '_').length > 0) {
                game.status = 'lose';
            }
            console.log('guessed', game);
            Game.update(game.userId, game.id, game, (err1, newGame) => {
                if (err1) {
                    res.json({msg: err1});
                } else {
                    console.log('guessing', newGame);
                    res.json(newGame);
                }
            });
        }
    });
});
/**************************************Library*************************************************/
var meta = {
    "levels": {
        "easy": {
            "name": "easy",
            "minLength": 3,
            "maxLength": 5,
            "guesses": 8
        },
        "medium": {
            "name": "medium",
            "minLength": 4,
            "maxLength": 10,
            "guesses": 7
        },
        "hard": {
            "name": "hard",
            "minLength": 9,
            "maxLength": 300,
            "guesses": 6
        }
    },
    "fonts": [
        {
            "url": "https://fonts.googleapis.com/css?family=Acme",
            "rule": "'Acme', Sans Serif",
            "family": "Acme",
            "category": "Sans Serif"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Alef",
            "rule": "'Alef', Sans Serif",
            "family": "Alef",
            "category": "Sans Serif"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Almendra",
            "rule": "'Almendra', Serif",
            "family": "Almendra",
            "category": "Serif"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Amiko",
            "rule": "'Amiko', Sans Serif",
            "family": "Amiko",
            "category": "Sans Serif"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Armata",
            "rule": "'Armata', Sans Serif",
            "family": "Armata",
            "category": "Sans Serif"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Artifika",
            "rule": "'Artifika', Serif",
            "family": "Artifika",
            "category": "Serif"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Bentham",
            "rule": "'Bentham', Serif",
            "family": "Bentham",
            "category": "Serif"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Cabin%20Sketch",
            "rule": "'Cabin Sketch', Display",
            "family": "Cabin Sketch",
            "category": "Display"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Capriola",
            "rule": "'Capriola', Sans Serif",
            "family": "Capriola",
            "category": "Sans Serif"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Content",
            "rule": "'Content', Display",
            "family": "Content",
            "category": "Display"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Contrail%20One",
            "rule": "'Contrail One', Display",
            "family": "Contrail One",
            "category": "Display"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Convergence",
            "rule": "'Convergence', Sans Serif",
            "family": "Convergence",
            "category": "Sans Serif"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Delius%20Unicase",
            "rule": "'Delius Unicase', Handwriting",
            "family": "Delius Unicase",
            "category": "Handwriting"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Didact%20Gothic",
            "rule": "'Didact Gothic', Sans Serif",
            "family": "Didact Gothic",
            "category": "Sans Serif"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Dorsa",
            "rule": "'Dorsa', Sans Serif",
            "family": "Dorsa",
            "category": "Sans Serif"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Dynalight",
            "rule": "'Dynalight', Display",
            "family": "Dynalight",
            "category": "Display"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=El%20Messiri",
            "rule": "'El Messiri', Sans Serif",
            "family": "El Messiri",
            "category": "Sans Serif"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Flamenco",
            "rule": "'Flamenco', Display",
            "family": "Flamenco",
            "category": "Display"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Fugaz%20One",
            "rule": "'Fugaz One', Display",
            "family": "Fugaz One",
            "category": "Display"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Galada",
            "rule": "'Galada', Display",
            "family": "Galada",
            "category": "Display"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Geostar%20Fill",
            "rule": "'Geostar Fill', Display",
            "family": "Geostar Fill",
            "category": "Display"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Gravitas%20One",
            "rule": "'Gravitas One', Display",
            "family": "Gravitas One",
            "category": "Display"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Gudea",
            "rule": "'Gudea', Sans Serif",
            "family": "Gudea",
            "category": "Sans Serif"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=IM%20Fell%20English",
            "rule": "'IM Fell English', Serif",
            "family": "IM Fell English",
            "category": "Serif"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Kranky",
            "rule": "'Kranky', Display",
            "family": "Kranky",
            "category": "Display"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Kreon",
            "rule": "'Kreon', Serif",
            "family": "Kreon",
            "category": "Serif"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Lobster",
            "rule": "'Lobster', Display",
            "family": "Lobster",
            "category": "Display"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Lora",
            "rule": "'Lora', Serif",
            "family": "Lora",
            "category": "Serif"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Medula%20One",
            "rule": "'Medula One', Display",
            "family": "Medula One",
            "category": "Display"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Miss%20Fajardose",
            "rule": "'Miss Fajardose', Handwriting",
            "family": "Miss Fajardose",
            "category": "Handwriting"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Molle",
            "rule": "'Molle', Handwriting",
            "family": "Molle",
            "category": "Handwriting"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Moulpali",
            "rule": "'Moulpali', Display",
            "family": "Moulpali",
            "category": "Display"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Open%20Sans%20Condensed",
            "rule": "'Open Sans Condensed', Sans Serif",
            "family": "Open Sans Condensed",
            "category": "Sans Serif"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Over%20the%20Rainbow",
            "rule": "'Over the Rainbow', Handwriting",
            "family": "Over the Rainbow",
            "category": "Handwriting"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Padauk",
            "rule": "'Padauk', Sans Serif",
            "family": "Padauk",
            "category": "Sans Serif"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Podkova",
            "rule": "'Podkova', Serif",
            "family": "Podkova",
            "category": "Serif"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Risque",
            "rule": "'Risque', Display",
            "family": "Risque",
            "category": "Display"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Sahitya",
            "rule": "'Sahitya', Serif",
            "family": "Sahitya",
            "category": "Serif"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Sarala",
            "rule": "'Sarala', Sans Serif",
            "family": "Sarala",
            "category": "Sans Serif"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Shadows%20Into%20Light",
            "rule": "'Shadows Into Light', Handwriting",
            "family": "Shadows Into Light",
            "category": "Handwriting"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Source%20Serif%20Pro",
            "rule": "'Source Serif Pro', Serif",
            "family": "Source Serif Pro",
            "category": "Serif"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Squada%20One",
            "rule": "'Squada One', Display",
            "family": "Squada One",
            "category": "Display"
        },
        {
            "url": "https://fonts.googleapis.com/css?family=Yesteryear",
            "rule": "'Yesteryear', Handwriting",
            "family": "Yesteryear",
            "category": "Handwriting"
        }
    ],
    "ttl": 180000,
    "defaults": {
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
};
