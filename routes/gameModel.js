/**
 * Created by yonki on 3/3/17.
 */
var db = require('./db');

function Game(userId, colors, font, level, target, view) {
    this.userId = userId;
    this.colors = colors;
    this.font = font;
    this.level = level.name;
    this.remaining = level.guesses;
    this.status = 'unfinished';
    this.timestamp = db.collection('game').size + 1;
    this.timeToComplete = (new Date()).valueOf();
    this.target = target.name;
    this.view = view;
    this.meta = {
        "colors" : colors,
        "level" : level,
        "font" : font,
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
    }
}

module.exports = Game;