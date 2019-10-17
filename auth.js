const config = require('./config.json');
const tokens = require('./tokens.json'); // be sure to add tokens!

module.exports = {  
    getToken: function() {
        if(config.environment == 'DEV'){
            return tokens.DEVtoken;
        }
        else if(config.environment == 'LIV'){
            return tokens.LIVtoken;
        }
    },
    
    getAuthor: tokens.author,

    getYoutubeApi: tokens.youtube
}