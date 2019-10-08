const Discord = require('discord.js');
var logger = require('winston');
const auth = require('./auth.js');
const config = require('./config.json');
const fs = require('fs');
const acceptedImageExtensions = ['jpg','png','jpeg','gif'];
const imagePaths = {
    cute: './Images/Cutes/',
    meme: './Images/Meme/',
    nice: './Images/Nice/',
    manga: './Images/Manga/',
    lewd: './Images/Lewd/'
} 
const bot = new Discord.Client();
var commandString, botAuthor;
config.environment === 'LIV' ? commandString = '~' : commandString = '-';
var cuteNames = memeNames = niceNames = mangaNames = lewdNames = new Array();
var lastDM = new Discord.Message();
var lastDMUser = new Discord.User();
init();

function InitGuilds() {
bot.guilds.array().forEach(guild => {
    if (!fs.existsSync('./Guilds/' + guild.id + '/'))
        {
            fs.mkdirSync('./Guilds/' + guild.id + '/');
            console.log('Guild directory created for ' + guild.name + ' id:' + guild.id );
        }
        guild.members.array().forEach(member => {
            if (!fs.existsSync('./Guilds/' + guild.id + '/' + member.id + '.json'))
            {
                var userDetails = { "Username" : member.user.tag, "CutieCoin" : 0,}
                var detailString = JSON.stringify(userDetails)
                fs.appendFileSync('./Guilds/' + guild.id + '/' + member.id + '.json',detailString,function(err) {
                    if (err) throw err;
                });
                
                console.log(`Created file for user : ${member.user.tag} id: ${member.id} on guild ${guild.name}.`);
            }
        });
});
console.log('Guilds initialized.');
}

function init() {
    var response = "", lengthTemp = 0;

    lengthTemp = cuteNames.length;
    if(fs.existsSync(imagePaths.cute)){
    console.log('Reading '+imagePaths.cute);
    cuteNames = fs.readdirSync(imagePaths.cute,function(err,result){
        if(err) console.log('error', err);
    });
    console.log(cuteNames.length + ' images loaded');
    }
    if (cuteNames.length > lengthTemp) {
        response += ((cuteNames.length - lengthTemp) + "cute pics added.\n");
    }

    lengthTemp = memeNames.length;
    if(fs.existsSync(imagePaths.meme)){
    console.log('Reading '+ imagePaths.meme);
    memeNames = fs.readdirSync(imagePaths.meme,function(err,result){
        if(err) console.log('error', err);
    });
    console.log(memeNames.length + ' images loaded');
    }
    if (memeNames.length > lengthTemp) {
        response += ((memeNames.length - lengthTemp) + "meme pics added.\n");
    }

    lengthTemp = niceNames.length;
    if(fs.existsSync(imagePaths.nice)){
    console.log('Reading '+imagePaths.nice);
    niceNames = fs.readdirSync(imagePaths.nice,function(err,result){
        if(err) console.log('error', err);
    });
    console.log(niceNames.length + ' images loaded');
    }
    if (niceNames.length > lengthTemp) {
        response += ((niceNames.length - lengthTemp) + "nice pics added.\n");
    }

    lengthTemp = mangaNames.length;
    if(fs.existsSync(imagePaths.manga)){
    console.log('Reading '+imagePaths.manga);
    mangaNames = fs.readdirSync(imagePaths.manga,function(err,result){
        if(err) console.log('error', err);
    });
    console.log(mangaNames.length + ' images loaded');
    }
    if (mangaNames.length > lengthTemp) {
        response += ((mangaNames.length - lengthTemp) + "manga pics added.\n");
    }

    lengthTemp = lewdNames.length;
    if(fs.existsSync(imagePaths.lewd)){
        console.log('Reading '+imagePaths.lewd);
        lewdNames = fs.readdirSync(imagePaths.lewd,function(err,result){
            if(err) console.log('error', err);
        });
    console.log(lewdNames.length + ' images loaded');
    }
    if (lewdNames.length > lengthTemp) {
        response += ((lewdNames.length - lengthTemp) + "lewd pics added.\n");
    }
    

    console.log('!!!All images loaded!!!');

    return response;
}

function GetUserDetails(userId,guildId){
    var user = JSON.parse(fs.readFileSync('./Guilds/' + guildId + '/' + userId + '.json'));
    return user;
}
function UpdateUserDetails(userJSON,userId,guildId){
    var userJsonString = JSON.stringify(userJSON);
    fs.writeFile('./Guilds/' + guildId + '/' + userId + '.json',userJsonString,err => {});
    console.log('Updated ' + userJSON.Username + '.');
}
function GiveCoin(userId,guildId,amount = 1){
    var userJSON = GetUserDetails(userId,guildId);
    var currentCoin = userJSON.CutieCoin;
    currentCoin = currentCoin + amount;
    userJSON.CutieCoin = currentCoin;
    UpdateUserDetails(userJSON,userId,guildId);
}
function TransferCoin(message,amount = 1){
    if (isNaN(parseInt(amount))) {
        return 'Please enter a number for amount';
    }
    else
    {
        amount = parseInt(amount);
    }
    
    if (!message.mentions.users.first()) {
        return 'You must mention someone to transfer coins to them.';
    }
    var userJSON = GetUserDetails(message.author.id,message.channel.guild.id);
    var coinOfUser = userJSON.CutieCoin;
    if ((coinOfUser - amount) < 0) {
        return 'You dont have enough coins for this transfer.';
    }
    message.reply(`Are you sure you want to give ${amount === 1 ? 'a coin' : amount + ' coins'} to ${message.mentions.users.first().tag}?`)
    const collector = WaitResponse(message,10000,'y yes ye');
    collector.on('collect',m => {
        GiveCoin(message.author.id,message.channel.guild.id,(amount * -1));
        GiveCoin(message.mentions.users.first().id,message.channel.guild.id,amount);
        collector.stop()
    })
    collector.on('end', collected => {
        if(collected.size > 0)
        {
            message.channel.send('Coin transfer successful!');
        }
        else
        {
            message.channel.send('Coin transfer cancelled.');
        }
    })
    
    
}

function getRandomImage(imageType){
    var targetImages, mainPath;
    switch (imageType) {
        case 'cute':
            targetImages = cuteNames;
            mainPath = imagePaths.cute;
            break;
        case 'meme':
            targetImages = memeNames;
            mainPath = imagePaths.meme;
            break;
        case 'manga':
            targetImages = mangaNames;
            mainPath = imagePaths.manga;
            break;
        case 'nice':
            targetImages = niceNames;
            mainPath = imagePaths.nice;
            break;
        case 'lewd':
            targetImages = lewdNames;
            mainPath = imagePaths.lewd;
            break;
    
        default:
            break;
    }
    var randomImage = targetImages[Math.floor(Math.random() * targetImages.length)]
    var fileExtension = randomImage.split('.');
    if (acceptedImageExtensions.includes(fileExtension[1])) {
        console.log('Image ready, returning... ' + mainPath + randomImage)
        return mainPath + randomImage
    }
    else{
        console.log('Wrong filetype, trying again...  /' + randomImage);
        return getRandomImage(imageType)
    }
}

function getBossState(time){
    if (time >= 20 || time <= 2) {
        return 'Active'
     } else {
         return 'Waiting...'
     }
}

class Boss {
    constructor(lmnt, name) {
        this.name = name;
        switch (lmnt) {
            case 'mech':
                this.lmnt = element.mech;
                break;
            case 'psyc':
                this.lmnt = element.psyc;
                break;
            case 'bio':
                this.lmnt = element.bio;
                break;
            default:
                this.lmnt = element.none;
                break;
        }
    }
}

function getBossDetails(){
    var bossFile = fs.readFileSync('Boss.txt');
    var rows = bossFile.toString().split("\n");
    var columns = rows[0].split("|");
    var bossDetails = new Boss(columns[0],columns[1]);
    var currentTime = new Date(Date.now());
    var bosstime = new Date(currentTime);
    bosstime.setHours(18);
    bosstime.setMinutes(00);
    var timeLeft = new Date(bosstime - currentTime);
    return 'Boss state: ' + getBossState(currentTime.getHours()) +
        '\nBoss name: ' + bossDetails.name +
        '\nBoss type: ' + bossDetails.lmnt.get + ' | Counter : ' + bossDetails.lmnt.counter +
         '\nTime until next boss : ' + timeLeft.getHours() + ' hours ' + (timeLeft.getMinutes()) + ' minutes.' 
             

}

function getBruhState(){
    var bruhAmount = Math.floor(Math.random() * 100);
    if (bruhAmount === 0) {
        return 'This is not a bruh moment.'
    }
    else if(bruhAmount === 1){
        return 'This surely is a bruh moment.'
    }
    else if(bruhAmount === 69){
        return 'This moment is worth 69 bruhs.Nice...'
    }
    else{
        return 'This moment is worth ' + bruhAmount + ' bruhs.'
    }
}

function rollDices(rollSettings){
    var rollSettings = rollSettings.split('d');
    var diceCount = rollSettings[0];
    var diceSides = rollSettings[1];
    var resultDices = '';
    console.log('Rolling ' + diceCount + ' dices...');
    if (diceCount === '1') {
        resultDices += 'Your ' + diceSides + ' sided dice roll is : ' + Math.floor(Math.random() * parseInt(diceSides) + 1);
    }
    else{
        var sum = 0;
        resultDices += 'Your ' + diceSides + ' sided dice rolls are :';
        var diceRoll = Math.floor(Math.random() * parseInt(diceSides) + 1)
        resultDices += ' ' + diceRoll;
        sum += diceRoll;
        for (let dice = 1; dice < diceCount; dice++){
            diceRoll = Math.floor(Math.random() * parseInt(diceSides) + 1)
            resultDices += ', ' + diceRoll;
            sum += diceRoll;
        }
        resultDices += '\nSum of these rolls are : ' + sum;
    }
    return resultDices;
}

function WaitResponse(Message,timer,responseWords = new String()){
    var responseArray = responseWords.split(',');
    console.log(`Awaiting response from ${Message.author.tag}...`)
    const filter = msg => msg.author === Message.author && responseArray.includes(msg.content);
    const collector = Message.channel.createMessageCollector(filter,{ time: timer});
    var response = null;
    collector.on('collect', m => {
        response = 'Acknowledged';
        collector.stop()
    })
    collector.on('end', collected => {
        response = (response == null ? 'Cancelled' : response);
        console.log(response);
    })
    return collector
}

function CollectReactions(Message,timer)
{
    console.log('Collecting reactions on a message...');
    const filter = (reaction,user) => true;
    const collector = Message.createReactionCollector(filter, { time: timer });
    collector.on('collect', r => {
        console.log(`Collected reaction from: ${r.users.last().tag}`)
    });
    collector.on('end', collected => {
        console.log(`Collected ${collected.size} reactions`);
        collector.users.array().forEach(user => {
            GiveCoin(user.id,Message.guild.id);
        });
    } );
}

function ReturnDelay(startTime) {
    var d = new Date();
    return d.getTime() - startTime;
}

const element = {
    mech:{
        get:'Mecha',
        counter:'Psychic'
    },
    psyc:{
        get:'Psychic',
        counter:'Biologic'
    },
    bio:{
        get:'Biologic',
        counter:'Mecha'
    },
    none:'No element'
}
//
// Initialize Discord Bot
bot.on('ready', () => {
    InitGuilds();
    console.log(`Logged in as ${bot.user.tag}!`);
    bot.fetchUser(auth.getAuthor).then(user => botAuthor = user);
  });
bot.on('guildCreate', () => {
    InitGuilds();
});
bot.on('guildMemberAdd', () => {
    InitGuilds();
});
bot.on('message', msg => {
    // Bot will listen for messages that will start with commandstring that comes from config

    if (msg.content.substring(0, 1) == commandString) {
        var args = msg.content.substring(1).split(' ');
        var cmd = args[0];
        var rollCheckRegex = /^\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(d)([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b$/;
       

        args = args.splice(1);
        if(msg.channel.type === "text")
        {
        switch(cmd) {
            
            case 'ping':
                var d = new Date();
                var time = d.getTime();
                msg.channel.send('pong').then(Message => {var delay = ReturnDelay(time);  Message.edit('Response delay is ' + delay + ' ms.')});
            break;
            case 'test':
                    const embed = new Discord.RichEmbed()
                    .setTitle('this be an embed')
                    .setColor(0xB79268)
                    .setDescription('embed af')
                    .setFooter('bruh')
                    .setTimestamp(new Date().getTime())
                    ;
                msg.channel.send(embed);
            break;
            case 'boss':
                msg.channel.send(getBossDetails());
            break;
            case 'cute':
                var attachment = new Discord.Attachment(getRandomImage('cute'));
                msg.channel.send(attachment).then(Message => { CollectReactions(Message,20000); });
                console.log('Request made by ' + msg.author.tag);
            break;
            case 'meme':
                var attachment = new Discord.Attachment(getRandomImage('meme'));
                msg.channel.send(attachment).then(Message => { CollectReactions(Message,20000); });
                console.log('Request made by ' + msg.author.tag);
            break;
            case 'nice':
                var attachment = new Discord.Attachment(getRandomImage('nice'));
                msg.channel.send(attachment).then(Message => { CollectReactions(Message,20000); });
                console.log('Request made by ' + msg.author.tag);
            break;
            case 'manga':
                var attachment = new Discord.Attachment(getRandomImage('manga'));
                msg.channel.send(attachment).then(Message => { CollectReactions(Message,20000); });
                console.log('Request made by ' + msg.author.tag);
            break;
            case 'lewd':
            case 'nsfw':
                var attachment = new Discord.Attachment(getRandomImage('lewd'));
                msg.channel.send(attachment);
                console.log('Request made by ' + msg.author.tag);
            break;

            case 'reinit':
                var response = init();
                msg.channel.send('reinitialize complete. \n' + response);
                break;

            case 'givecoin':
                var response = TransferCoin(msg,args[1]);
                if (response != null) {
                    msg.reply(response);    
                }
                break;


            case 'music':
                var musicType = args[0];
                if (musicType === 'swing'|| musicType === 'cafe') {
                    if (msg.member.voiceChannel) {
                        msg.member.voiceChannel.join()
                            .then(connection => { // Connection is an instance of VoiceConnection
                                msg.reply(`Started playing ${musicType} stream...`);
                                const dispatcher = connection.playArbitraryInput(`http://lainon.life:8000/${musicType}.mp3`);
                            })
                        .catch(console.log);
                    } else {
                      msg.reply('You need to join a voice channel first!');
                    }
                }
                else if (musicType === 'leave')
                {
                    if (msg.guild.me.voiceChannel !== undefined) {
                        msg.guild.me.voiceChannel.leave();
                    }
                }
                else
                {
                    msg.reply(`Please use \"${commandString}music [MusicType]\" to start streaming. Available musictypes: swing, cafe`);
                }
                
                break;


            case 'do a flip':
                msg.channel.send('flips u r mather xD');
                break;
            case 'bruh':
                msg.channel.send(getBruhState());
                break;
            case 'shutdown':
                msg.channel.send('okay :(');
                bot.destroy();
         }
        }
        
         if (rollCheckRegex.test(cmd)) {
            msg.channel.send(rollDices(cmd));
         }
    }
    if (msg.channel.type === "dm") {
        if (msg.author === lastDMUser) {
            lastDM.edit(`${lastDM.content}\`\`\`${msg.content}\`\`\``);
        }
        else if (msg.author != bot.user) {
            botAuthor.createDM().then(channel => channel.send(`${msg.author.tag} has DM'd me these messages : \`\`\`${msg.content}\`\`\``).then(message => lastDM = message));
            lastDMUser = msg.author;
        }
    }
    var matherCheck = /\banan/i;
    if (matherCheck.test(msg.content)) {
        msg.channel.send('hayır u r mather xD');
    }
    if (msg.content.toLowerCase() === 'ayy') {
        msg.channel.send('lmao');
    }
//
    if (msg.author != bot.user && msg.attachments.size > 1 && acceptedImageExtensions.includes(msg.attachments.first().filename.split('.')[1])) {
        CollectReactions(msg,20000);
    }
    if (msg.content === 'Save this image^') {
        msg.channel.fetchMessages({limit: 1, before : msg.id})
            .then(message => {
                if (message.first().attachments.size === 0) {
                    msg.channel.send("That's not an image that I can save!");
                }
                else{
                    var messageAttachments = message.first().attachments;
                    var saveChannel = bot.channels.get("629578376088256512");
                    messageAttachments.forEach(messageAttachment => {
                        saveChannel.send({file : messageAttachment.url});
                    msg.channel.send("Done!");
                });
                }
            })
            .catch(console.error);
    }
});


process.on('uncaughtException', function (err) {
    botAuthor.createDM().then(channel => channel.send(`Bot died with exception: ${err}`));
    bot.destroy();
  });

bot.login(auth.getToken());