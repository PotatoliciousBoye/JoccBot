const Discord = require('discord.js');
var logger = require('winston');
const auth = require('./auth.js');
const fs = require('fs');
const acceptedImageExtensions = ['jpg','png','jpeg','gif'];
const imagePaths = {
    cute: './Images/Cutes/',
    meme: './Images/Meme/',
    nice: './Images/Nice/',
    manga: './Images/Manga/',
    lewd: './Images/Lewd/'
} 
var cuteNames = memeNames = niceNames = mangaNames = lewdNames = new Array();
init();


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
        console.log('image ready returning... ' + mainPath + randomImage)
        return mainPath + randomImage
    }
    else{
        console.log('Wrong Filetype, Trying again...  /' + randomImage);
        return getRandomImage(imageType)
    }
}

function getBossState(time){
    if (time >= 20 || time <= 2) {
        return 'Aktif'
     } else {
         return 'Beklemede'
     }
}

function Boss(lmnt, name) {
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
            this.lmnt = element.nope;
            break;
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
    return 'Boss Durumu: ' + getBossState(currentTime.getHours()) +
        '\nBoss Adı: ' + bossDetails.name +
        '\nBoss Tipi: ' + bossDetails.lmnt.get + ' | Üstün Element : ' + bossDetails.lmnt.counter +
         '\nBossa Kalan Süre: ' + timeLeft.getHours() + ' saat ' + (timeLeft.getMinutes()) + ' dakika' 
             

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

function CollectReactions(Message,timer)
{
    console.log('Collecting reactions for an image...');
    const filter = (reaction,user) => true;
    const collector = Message.createReactionCollector(filter, { time: timer });
    collector.on('collect', r => console.log(`Collected reaction from: ${r.users.last().tag}`));
    collector.on('end', collected => console.log(`Collected ${collected.size} reactions`));
}

function ReturnDelay(startTime) {
    var d = new Date();
    return d.getTime() - startTime;
}

const element = {
    mech:{
        get:'Mecha',
        counter:'Psychic(mor)'
    },
    psyc:{
        get:'Psychic',
        counter:'Biologic(turuncu)'
    },
    bio:{
        get:'Biologic',
        counter:'Mecha(mavi)'
    },
    nope:'error'
}

// Initialize Discord Bot
const bot = new Discord.Client();
bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`);
  });
bot.on('message', msg => {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `~`

    if (msg.content.substring(0, 1) == '-') {
        var args = msg.content.substring(1).split('|');
        var cmd = args[0];
        var rollCheckRegex = /^\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(d)([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b$/;
       

        args = args.splice(1);
        switch(cmd) {
            // !ping
            case 'ping':
                var d = new Date();
                var time = d.getTime();
                msg.channel.send('pong').then(Message => {var delay = ReturnDelay(time);  Message.edit('Response delay is ' + delay + ' ms.')});
            break;
            case 'test':
                msg.channel.send(typeof(args));
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



            case 'do a flip':
                msg.channel.send('flips u r mather xD');
                break;
            case 'kahve':
            case 'sıcak kahve':
                msg.channel.send(msg.author.username + ' botuma yavşama pls.');
            break;
            case 'yağız çalışıyo mu':
                var currentHour = new Date(Date.now()).getHours();
                var mesaj;
                if (currentHour >= 8 && currentHour <= 17) {
                    mesaj = 'evet';
                 } else {
                     mesaj = 'hayır';
                 }
                 msg.channel.send(mesaj);
            break;
            case 'yağız evde mi':
                var currentHour = new Date(Date.now()).getHours();
                var mesaj;
                if (currentHour >= 8 && currentHour <= 17) {
                    mesaj = 'hayır';
                 } else {
                     mesaj = 'belki';
                 }
                 msg.channel.send(mesaj);
            break;
            case 'bruh':
                msg.channel.send(getBruhState());
                break;
         }
         if (rollCheckRegex.test(cmd)) {
            msg.channel.send(rollDices(cmd));
         }
     }
    var matherCheck = /\banan/i;
    if (matherCheck.test(msg.content)) {
        msg.channel.send('hayır u r mather xD');
    }
    if (msg.content.toLowerCase() === 'ayy') {
        msg.channel.send('lmao');
    }

    if (msg.attachments.size > 0) {
        msg.channel.send("nice pic hudo");
    }
});

bot.login(auth.getToken());