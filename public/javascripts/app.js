/**
 * Created by yonki on 2/26/17.
 */
var modalState = {
    modal : {wordGame : null},
    page : {pages : ["login", "content", "gameModal", "result"], page : null},
    user : null,
    csrf : null,
    guessing : ' '
};

/*$(document).ready(function () {
    $.ajax({
        url : '/user',
        method : 'GET',
        success : (user) => {$('body').show().addClass('background'); setUser(user);},
        error : () => {$('body').show().addClass('background'); setPage('login');}
    });
    setFonts();
});*/

$(document).ready(function () {
    setFonts();
    setPage('login');
});

function setPage(page) {
    modalState.page.page = page;
    if(page == 'login')
    {
        $('body').addClass('background');
    } else
        if(page == 'content')
        {
            getWordGame();
        } else
            {
        $('body').removeClass('background');
    }

  $('#content').show();

    modalState.page.pages.forEach(
        p => {
            var selector = "#" + p;
            modalState.page.page == p ? $(selector).show() : $(selector).hide();
        }
    );
}

function setCSRFToNull() {
    modalState.csrf = null;
}

function setUser(user) {
    console.log('user', user);
    modalState.user = user;
    $('#email').text(user && user.email);
    setHomePage(user);
    setPage(user ? 'content' : 'login');
}

function login(event){
    event.preventDefault();
    var password = $('#login_password').val();
    var email = $('#login_email').val();
    if(!emailValidation(email))
    {
        alert('Please enter validate email address');
        $('#login_email').val('');
    }
    var csrf = gcsrf();
    modalState.csrf = csrf;
    $('#login_email').val('');
    $('#login_password').val('');
    console.log('login modalState.csrf', modalState.csrf);
    $.ajax({
        url : '/wordgame/api/v2/login',
        method : 'POST',
        data : { "email" : email, "password" : password},
        headers : {'X-csrf' : modalState.csrf},
        success : setUser
    });
}

function logout(event) {
    setPage('login');
    setCSRFToNull();
    setUser(null);
    $.ajax({
        url : '/wordgame/api/v2/logout',
        method : 'POST',
    })
}

function emailValidation(email) {
    var pattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
    return pattern.test(email);
}

function setGame(wordgame) {
    console.log('wordgame', wordgame);
    modalState.modal.wordGame = wordgame;
    setFont();
    var guess_entered = document.getElementById("guess_entered");
    while (guess_entered.firstElementChild)
    {
        guess_entered.removeChild(guess_entered.firstElementChild);
    }
    document.getElementById('remaining').innerHTML = modalState.modal.wordGame.remaining + ' guesses remaining.';
    var guess_target = document.getElementById('guess_target');
    while (guess_target.firstElementChild)
    {
        guess_target.removeChild(guess_target.firstElementChild);
    }
    for(var i = 0; i < modalState.modal.wordGame.target.length; i++)
    {
        var span = document.createElement("span");
        span.class = 'btn btn-sm guess_span';
        span.innerHTML = '_';
        span.style.fontFamily = modalState.modal.wordGame.font.rule;
        span.style.backgroundColor = modalState.modal.wordGame.colors.guessBackground;
        span.style.color = modalState.modal.wordGame.colors.wordBackground;
        guess_target.appendChild(span);
        span = document.createElement("span");
        span.innerHTML = '  ';
        guess_target.appendChild(span);
    }
    setPage('gameModal');
}

function setFonts() {
    var i = 0;
    for(i; i < meta.fonts.length; i++){
        var options = document.createElement('option');
        options.setAttribute('value', meta.fonts[i].family);
        options.innerHTML = meta.fonts[i].family;
        document.getElementById('font').appendChild(options);
    }
}

function setFont() {
    var font = document.getElementById('font').value;
    document.getElementById('gameModal').style.font = font;
}

function guessing(game) {
    console.log('guessing', game);
    console.log('guessing_game', modalState.modal.wordGame);
    if(game[0].status == 'victory')
    {
        success();
    } else
    if(game[0].status == 'lose')
    {
        fail();
    } else
        if(game[0].status == 'unfinished')
        {
            document.getElementById('remaining').innerHTML = game[0].remaining + ' guesses remaining.';
            console.log('remaining', game[0].remaining);
            var guess_target = document.getElementById('guess_target');
            while(guess_target.firstElementChild)
            {
                guess_target.removeChild(guess_target.firstElementChild);
            }
            for(var i = 0; i < game[0].target.length; i++)
            {
                var span = document.createElement("span");
                span.class = 'btn btn-sm';
                span.innerHTML = game[0].view[i];
                span.style.backgroundColor = game[0].colors.guessBackground;
                span.style.fontFamily = game[0].font.rule;
                span.style.color = game[0].colors.wordBackground;
                console.log('span', span);
                guess_target.appendChild(span);
                span = document.createElement("span");
                span.innerHTML = '  ';
                guess_target.appendChild(span);
            }
        }
    var guess_entered = document.getElementById('guess_entered');
    var span1 = document.createElement("span");
    span1.class = 'btn btn-sm';
    span1.innerHTML = modalState.guessing;
    span1.style.fontFamily = game[0].font.rule;
    span1.style.color = game[0].colors.wordBackground;
    span1.style.backgroundColor = game[0].colors.textBackground;
    guess_entered.appendChild(span1);
    span = document.createElement("span");
    span.innerHTML = '  ';
    guess_entered.appendChild(span);
}

function success() {
    var timeToComplete = (new Date()).valueOf() - modalState.modal.wordGame.timeToComplete;
    modalState.modal.wordGame.timeToComplete = timeToComplete;
    modalState.modal.wordGame.view = modalState.modal.wordGame.target;
    modalState.modal.wordGame.status = 'victory';
    $('#gameModal').hide();
    document.getElementById('guess_process').value = document.getElementById('guess_entered').value;
    document.getElementById('guess_process').style = document.getElementById('guess_entered').style;
    document.getElementById('target_result').innerHTML = modalState.modal.wordGame.target;
    document.getElementById('target_result').style.backgroundColor = modalState.modal.wordGame.colors.guessBackground;
    document.getElementById('guess_result').style.backgroundImage =  "url(../images/winner.gif)";
    document.getElementById('target_result').style.fontFamily = modalState.modal.wordGame.font.rule;
    document.getElementById('target_result').style.color = modalState.modal.wordGame.colors.wordBackground;
    document.getElementById('background').className = 'success';
    $('#result').show();
    modalState.wordGame = null;
}

function fail() {
    modalState.modal.wordGame.timeToComplete = null  ;
    modalState.modal.wordGame.view = modalState.modal.wordGame.target;
    modalState.modal.wordGame.status = 'lose';
    $('#gameModal').hide();
    document.getElementById('guess_process').value = document.getElementById('guess_entered').value;
    document.getElementById('guess_process').style = document.getElementById('guess_entered').style;
    document.getElementById('target_result').innerHTML = modalState.modal.wordGame.target;
    document.getElementById('target_result').style.backgroundColor = modalState.modal.wordGame.colors.guessBackground;
    document.getElementById('guess_result').style.backgroundImage =  "url(../images/cry.gif)";
    document.getElementById('target_result').style.fontFamily = modalState.modal.wordGame.font.rule;
    document.getElementById('target_result').style.color = modalState.modal.wordGame.colors.wordBackground;
    document.getElementById('background').className = 'fail';
    $('#result').show();
    modalState.wordGame = null;
}

function quitGame(event) {
    setPage('content');
}

function makeRow(type, values) {
    return $(`<tr><${type}>` + values.join(`</${type}><${type}>`) + `</${type}></${type}>` );
}

function generateTable(games) {
    console.log('get_table_games', games);
    var table = document.getElementById('save_game');
    while(table.firstElementChild)
    {
        table.removeChild(table.firstElementChild);
    }
    var props = ['Level', 'Phrase', 'Remaining', 'Answer', 'Status'];
    makeRow('th', props).appendTo(table);
    games.forEach( (wordgame) => {
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.innerHTML = wordgame.level;
        tr.appendChild(td);
        var guess_target = document.createElement('td');
        guess_target.style.fontFamily = wordgame.font.rule;
        /*guess_target.style.font = wordgame.font;*/
        for(var i = 0; i < wordgame.target.length; i++)
        {
            var span = document.createElement("span");
            span.class = 'btn btn-sm';
            span.innerHTML = wordgame.view[i];
            span.style.backgroundColor = wordgame.colors.guessBackground;
            span.style.fontFamily = wordgame.font.rule;
            span.style.color = wordgame.colors.wordBackground;
            guess_target.appendChild(span);
            span = document.createElement("span");
            span.innerHTML = ' ';
            guess_target.appendChild(span);
        }
        tr.appendChild(guess_target);
        td = document.createElement('td');
        td.innerHTML = wordgame.remaining;
        tr.appendChild(td);
        td = document.createElement('td');
        td.innerHTML = wordgame.target;
        tr.appendChild(td);
        td = document.createElement('td');
        td.innerHTML = wordgame.status;
        tr.appendChild(td);
        tr.click((event) => continueWordGame(wordgame));
        table.appendChild(tr);
        wordgame.row = tr;
    });
}

function showPhrase(type, wordgame) {
    var guess_target = document.createElement(type);
    for(var i = 0; i < wordgame.target.length; i++)
    {
        var span = document.createElement("span");
        span.class = 'btn btn-sm';
        span.innerHTML = wordgame.view[i];
        span.style.color = wordgame.colors.textBackground;
        guess_target.appendChild(span);
    }
    return guess_target;
}

function continueGame(wordgame) {
    $('#content').hide();
    modalState.wordGame = wordgame;
    document.getElementById('gameModal').style.font = modalState.wordGame.font.value;
    document.getElementById('remaining').innerHTML = modalState.wordGame.remaining.value + ' guesses remaining.';
    document.getElementById('guess_target').appendChild(showPhrase('span', wordgame));
    $('#gameModal').show();
}

function gcsrf() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
};

function setHomePage(user) {
    modalState.user = user;
    console.log('user', user);
    var font = user.defaults.font.family;
    console.log('default.font', font);
    var guessBackground = user.defaults.colors.guessBackground;
    console.log('default.guessBackground', guessBackground);
    var textBackground = user.defaults.colors.textBackground;
    var wordBackground = user.defaults.colors.wordBackground;
    var level = user.defaults.level.name;
    $('#font').val(font);
    document.getElementById('guessBackground').value = guessBackground;
    document.getElementById('textBackground').value = textBackground;
    document.getElementById('wordBackground').value = wordBackground;
    $('#level').val(level);
}

/****************************************AJAX**************************************************/
function createWordGame(event)
{
    var fonts = $('#font').val();
    fonts = meta.fonts.filter((f) => f.family == fonts );
    var font = fonts[0];
    console.log('font', font);
    var url = font.url;
    var rule = font.rule;
    var family = font.family;
    var category = font.category;
    var guessBackground = document.getElementById('guessBackground').value;
    var textBackground = document.getElementById('textBackground').value;
    var wordBackground = document.getElementById('wordBackground').value;
    var level = meta.levels[$('#level').val()];
    var name = level.name;
    var minLength = level.minLength;
    var maxLength = level.maxLength;
    var guesses = level.guesses;

    $.ajax({
        url: '/wordgame/api/v2/' + modalState.user.id,
        method : 'post',
        data : {
            url : url,
            rule : rule,
            family : family,
            category : category,
            guessBackground : guessBackground,
            textBackground : textBackground,
            wordBackground : wordBackground,
            name : name,
            minLength : minLength,
            maxLength : maxLength,
            guesses : guesses
        },
        headers : {'X-csrf' : modalState.csrf},
        success : setGame

    });
}

function getWordGame() {
    $.ajax({
        url : '/wordgame/api/v2/' + modalState.user.id,
        method : 'get',
        headers : {'X-csrf' : modalState.csrf},
        success : generateTable
    })
}

function continueWordGame() {
    $('#content').hide();
    setFont();
    document.getElementById('gameModal').style.font = modalState.wordGame.font;
    document.getElementById('remaining').innerHTML = modalState.wordGame.remaining + ' guesses remaining.';
    var guess_target = document.getElementById('guess_target').value;
    for(var i = 0; i < modalState.wordGame.target.length; i++)
    {
        var span = document.createElement("span");
        span.class = 'label label-info';
        span.innerHTML = '_';
        modalState.wordGame.view.value += '_';
        span.style.color = modalState.wordGame.colors.textBackground;
        guess_target.appendChild(span);
    }
    $('#gameModal').show();
    $.ajax({
        url : 'wordGame/api/v2/' + modalState.wordGame.id + modalState.wordGame.gid,
        method: 'get',
        headers : {'X-csrf' : modalState.csrf},
        success : continueGame()
    })
}

function guessWord(event) {
    var guess = $('#guess_char').val();
    modalState.guessing = guess;
    $('#guess_char').val('');
    $.ajax({
        url : '/wordgame/api/v2/' + modalState.user.id + '/' + modalState.modal.wordGame.id + '/guesses',
        method : 'post',
        data : {
            guess : guess
        },
        headers : {'X-csrf' : modalState.csrf},
        success : guessing
    })
}

function changeDefaults() {
    var fonts = $('#font').val();
    fonts = meta.fonts.filter((f) => f.family == fonts );
    var font = fonts[0];
    console.log('font', font);
    var url = font.url;
    var rule = font.rule;
    var family = font.family;
    var category = font.category;
    var guessBackground = document.getElementById('guessBackground').value;
    var textBackground = document.getElementById('textBackground').value;
    var wordBackground = document.getElementById('wordBackground').value;
    var level = meta.levels[$('#level').val()];
    var name = level.name;
    var minLength = level.minLength;
    var maxLength = level.maxLength;
    var guesses = level.guesses;
    console.log('level', level);
    console.log('modalState.csrf', modalState.csrf);
    $.ajax({
        url : '/wordgame/api/v2/' + modalState.user.id + '/defaults',
        method : 'put',
        data : {
            url : url,
            rule : rule,
            family : family,
            category : category,
            guessBackground : guessBackground,
            textBackground : textBackground,
            wordBackground : wordBackground,
            name : name,
            minLength : minLength,
            maxLength : maxLength,
            guesses : guesses
        },
        headers : { 'X-csrf' : modalState.csrf}
    });

}


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

