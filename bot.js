//#region required libs
const Discord = require('discord.js');
const Authorization = require('./auth.js');
const Ytdl = require('ytdl-core');
const Config = require('./config.json');
const FileSystem = require('fs');
const StreamLinks = require('./streamlinks.json');
var YoutubeSearch = require("youtube-search");
var YoutubePlaylist = require("youtube-playlist");
//#endregion
//#region global parameters
const AcceptedImageExtensions = ['jpg', 'png', 'jpeg', 'gif'];
const ImagePaths = 
{
    Cute:   './Images/Cutes/',
    Meme:   './Images/Meme/',
    Nice:   './Images/Nice/',
    Manga:  './Images/Manga/',
    Lewd:   './Images/Lewd/'
}
const MusicQueryType = 
{
    Soundcloud:         0,
    YoutubeURL:         1,
    YoutubeQuery:       2,
    YoutubePlaylistURL: 3,
    Other:              -1
}
const Queue = new Map();
const Bot = new Discord.Client();
var CommandString, BotAuthor;
Config.environment === 'LIV' ? CommandString = '~' : CommandString = '-';
var cuteNames = memeNames = niceNames = mangaNames = lewdNames = new Array();
var LastDM = new Discord.Message();
var LastDMUser = new Discord.User();
const Sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
//#endregion
//#region init
function InitGuilds() {
    Bot.guilds.array().forEach(guild => {
        if (!FileSystem.existsSync('./Guilds/' + guild.id + '/')) {
            FileSystem.mkdirSync('./Guilds/' + guild.id + '/');
            console.log('Guild directory created for ' + guild.name + ' id:' + guild.id);
        }
        guild.members.array().forEach(member => {
            if (!FileSystem.existsSync('./Guilds/' + guild.id + '/' + member.id + '.json')) {
                var userDetails = { "Username": member.user.tag, "CutieCoin": 0, }
                var detailString = JSON.stringify(userDetails)
                FileSystem.appendFileSync('./Guilds/' + guild.id + '/' + member.id + '.json', detailString, function (err) {
                    if (err) throw err;
                });

                console.log(`Created file for user : ${member.user.tag} id: ${member.id} on guild ${guild.name}.`);
            }
        });
    });
    console.log('Guilds initialized.');
}

function Init() {
    var response = "", lengthTemp = 0;

    lengthTemp = cuteNames.length;
    if (FileSystem.existsSync(ImagePaths.Cute)) {
        console.log('Reading ' + ImagePaths.Cute);
        cuteNames = FileSystem.readdirSync(ImagePaths.Cute, function (err, result) {
            if (err) console.log('error', err);
        });
        console.log(cuteNames.length + ' images loaded');
    }
    if (cuteNames.length > lengthTemp) {
        response += ((cuteNames.length - lengthTemp) + "cute pics added.\n");
    }

    lengthTemp = memeNames.length;
    if (FileSystem.existsSync(ImagePaths.Meme)) {
        console.log('Reading ' + ImagePaths.Meme);
        memeNames = FileSystem.readdirSync(ImagePaths.Meme, function (err, result) {
            if (err) console.log('error', err);
        });
        console.log(memeNames.length + ' images loaded');
    }
    if (memeNames.length > lengthTemp) {
        response += ((memeNames.length - lengthTemp) + "meme pics added.\n");
    }

    lengthTemp = niceNames.length;
    if (FileSystem.existsSync(ImagePaths.Nice)) {
        console.log('Reading ' + ImagePaths.Nice);
        niceNames = FileSystem.readdirSync(ImagePaths.Nice, function (err, result) {
            if (err) console.log('error', err);
        });
        console.log(niceNames.length + ' images loaded');
    }
    if (niceNames.length > lengthTemp) {
        response += ((niceNames.length - lengthTemp) + "nice pics added.\n");
    }

    lengthTemp = mangaNames.length;
    if (FileSystem.existsSync(ImagePaths.Manga)) {
        console.log('Reading ' + ImagePaths.Manga);
        mangaNames = FileSystem.readdirSync(ImagePaths.Manga, function (err, result) {
            if (err) console.log('error', err);
        });
        console.log(mangaNames.length + ' images loaded');
    }
    if (mangaNames.length > lengthTemp) {
        response += ((mangaNames.length - lengthTemp) + "manga pics added.\n");
    }

    lengthTemp = lewdNames.length;
    if (FileSystem.existsSync(ImagePaths.Lewd)) {
        console.log('Reading ' + ImagePaths.Lewd);
        lewdNames = FileSystem.readdirSync(ImagePaths.Lewd, function (err, result) {
            if (err) console.log('error', err);
        });
        console.log(lewdNames.length + ' images loaded');
    }
    if (lewdNames.length > lengthTemp) {
        response += ((lewdNames.length - lengthTemp) + "lewd pics added.\n");
    }


    console.log('!!!All images loaded!!!');

    return response;
}
//#endregion

function AddStreamLink(testResult, url, name, msg) {
    if (testResult === "success") {
        StreamLinks[name] = url;
        FileSystem.writeFile('./streamLinks.json', JSON.stringify(StreamLinks), err => { });
        msg.edit(`Added '${url}' to stream links as '${name}'.`);
    }
    else {
        msg.edit(`An invalid link was provided.`);
    }
}

async function TestLinkandExecute(url, msg, func, param) {

    const testServer = Bot.guilds.get(Authorization.getTestServerId);
    const testVC = Bot.channels.get(Authorization.getTestId);
    if (testServer.me.voiceChannel === testVC) {
        return msg.edit("There is already a test going on, please try again later.");
    }
    var connection = await testVC.join()
    var isSuccess = false;
    const dispatcher = connection.playArbitraryInput(url);
    dispatcher.on('speaking', val => { if (val === true) { func("success", url, param, msg); isSuccess = true; testVC.leave() } });
    dispatcher.on('end', () => { if (isSuccess === false) { func("fail", url, param, msg); testVC.leave() } });

}

function GetUserDetails(userId, guildId) {
    var user = JSON.parse(FileSystem.readFileSync('./Guilds/' + guildId + '/' + userId + '.json'));
    return user;
}
function UpdateUserDetails(userJSON, userId, guildId) {
    var userJsonString = JSON.stringify(userJSON);
    FileSystem.writeFile('./Guilds/' + guildId + '/' + userId + '.json', userJsonString, err => { });
    console.log('Updated ' + userJSON.Username + '.');
}
function GiveCoin(userId, guildId, amount = 1) {
    var userJSON = GetUserDetails(userId, guildId);
    var currentCoin = userJSON.CutieCoin;
    currentCoin = currentCoin + amount;
    userJSON.CutieCoin = currentCoin;
    UpdateUserDetails(userJSON, userId, guildId);
}
function TransferCoin(message, amount = 1) {
    if (isNaN(parseInt(amount))) {
        return 'Please enter a number for amount';
    }
    else {
        amount = parseInt(amount);
    }

    if (!message.mentions.users.first()) {
        return 'You must mention someone to transfer coins to them.';
    }
    var userJSON = GetUserDetails(message.author.id, message.channel.guild.id);
    var coinOfUser = userJSON.CutieCoin;
    if ((coinOfUser - amount) < 0) {
        return 'You dont have enough coins for this transfer.';
    }
    message.reply(`Are you sure you want to give ${amount === 1 ? 'a coin' : amount + ' coins'} to ${message.mentions.users.first().tag}?`)
    const collector = WaitResponse(message, 10000, 'y yes ye');
    collector.on('collect', m => {
        GiveCoin(message.author.id, message.channel.guild.id, (amount * -1));
        GiveCoin(message.mentions.users.first().id, message.channel.guild.id, amount);
        collector.stop()
    })
    collector.on('end', collected => {
        if (collected.size > 0) {
            message.channel.send('Coin transfer successful!');
        }
        else {
            message.channel.send('Coin transfer cancelled.');
        }
    })


}

function GetRandomImage(imageType) {
    var targetImages, mainPath;
    switch (imageType) {
        case 'cute':
            targetImages = cuteNames;
            mainPath = ImagePaths.Cute;
            break;
        case 'meme':
            targetImages = memeNames;
            mainPath = ImagePaths.Meme;
            break;
        case 'manga':
            targetImages = mangaNames;
            mainPath = ImagePaths.Manga;
            break;
        case 'nice':
            targetImages = niceNames;
            mainPath = ImagePaths.Nice;
            break;
        case 'lewd':
            targetImages = lewdNames;
            mainPath = ImagePaths.Lewd;
            break;

        default:
            break;
    }
    var randomImage = targetImages[Math.floor(Math.random() * targetImages.length)]
    var fileExtension = randomImage.split('.');
    if (AcceptedImageExtensions.includes(fileExtension[1])) {
        console.log('Image ready, returning... ' + mainPath + randomImage)
        return mainPath + randomImage
    }
    else {
        console.log('Wrong filetype, trying again...  /' + randomImage);
        return GetRandomImage(imageType)
    }
}

function GetBossState(time) {
    if (time >= 20 || time <= 2) {
        return 'Active'
    } else {
        return 'Waiting...'
    }
}


function GetBruhState() {
    var bruhAmount = Math.floor(Math.random() * 100);
    if (bruhAmount === 0) {
        return 'This is not a bruh moment.'
    }
    else if (bruhAmount === 1) {
        return 'This surely is a bruh moment.'
    }
    else if (bruhAmount === 69) {
        return 'This moment is worth 69 bruhs.Nice...'
    }
    else {
        return 'This moment is worth ' + bruhAmount + ' bruhs.'
    }
}

function RollDices(rollSettings) {
    var rollSettings = rollSettings.split('d');
    var diceCount = rollSettings[0];
    var diceSides = rollSettings[1];
    var resultDices = '';
    console.log('Rolling ' + diceCount + ' dices...');
    if (diceCount === '1') {
        resultDices += 'Your ' + diceSides + ' sided dice roll is : ' + Math.floor(Math.random() * parseInt(diceSides) + 1);
    }
    else {
        var sum = 0;
        resultDices += 'Your ' + diceSides + ' sided dice rolls are :';
        var diceRoll = Math.floor(Math.random() * parseInt(diceSides) + 1)
        resultDices += ' ' + diceRoll;
        sum += diceRoll;
        for (let dice = 1; dice < diceCount; dice++) {
            diceRoll = Math.floor(Math.random() * parseInt(diceSides) + 1)
            resultDices += ', ' + diceRoll;
            sum += diceRoll;
        }
        resultDices += '\nSum of these rolls are : ' + sum;
    }
    return resultDices;
}

function WaitResponse(message, timer, responseWords = new String()) {
    var responseArray = responseWords.split(',');
    console.log(`Awaiting response from ${message.author.tag}...`)
    const filter = msg => msg.author === message.author && responseArray.includes(msg.content);
    const collector = message.channel.createMessageCollector(filter, { time: timer });
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

function CollectReactions(message, timer) {
    console.log('Collecting reactions on a message...');
    const filter = (reaction, user) => true;
    const collector = message.createReactionCollector(filter, { time: timer });
    collector.on('collect', r => {
        console.log(`Collected reaction from: ${r.users.last().tag}`)
    });
    collector.on('end', collected => {
        console.log(`Collected ${collected.size} reactions`);
        collector.users.array().forEach(user => {
            GiveCoin(user.id, message.guild.id);
        });
    });
}

async function AsyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}


//#region OptimizedMusicPlayer
function GetQueryType(query)
{
    var playListCheck =         /\b(list=)/i; 
    var youtubeLinkCheck =      /\b(youtube.com|youtu.be)/i; 
    var soundcloudLinkCheck =   /\b(soundcloud.com)/i; 
    if (playListCheck.test(query)) 
        return MusicQueryType.YoutubePlaylistURL;

    if (youtubeLinkCheck.test(query)) 
        return MusicQueryType.YoutubeURL;    

    if (soundcloudLinkCheck.test(query))
        return MusicQueryType.Soundcloud;

    return MusicQueryType.YoutubeQuery;
}

async function PushSongDataToQueue(query, serverQueue) 
{
    switch (GetQueryType(query)) {
        case MusicQueryType.YoutubePlaylistURL:
            throw `playlist adding not yet implemented.`;

        case MusicQueryType.Soundcloud:
            throw `soundcloud playing is not yet implemented.`;

        case MusicQueryType.YoutubeURL:
            const songInfo = await Ytdl.getInfo(youtubeId);

            return AddSongToQueue({
                title: songInfo.title,
                url: songInfo.video_url,
                type: 'youtube'
            });

        case MusicQueryType.YoutubeQuery:
            throw `query searching not implemented.`;
    }
}



async function BuildQueueConstructForGuild(message)
{
    const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true,
    };

    Queue.set(message.guild.id, queueContruct);
}
function ParseYoutubeToReadable(url) {
    return Ytdl(song.url, { quality: "highestaudio", filter: "audioonly" });
}
function DisplayQueue(serverQueue) {
    if (serverQueue) {
        return serverQueue.songs;
    }
    throw `The queue list is empty, try adding a song to the queue first.`;
}

function PlayPause(connection, message) {
    if (typeof connection.dispatcher != 'undefined') {
        if (connection.dispatcher.paused === true) {
            connection.dispatcher.resume();
            message.edit('resuming...');
        }
        else {
            connection.dispatcher.pause();
            message.edit('paused.');
        }
    }
    throw `Music player is not connected to a voicechannel.`;
}

function PauseCurrentPlayer(connection) {
    if (typeof connection.dispatcher != 'undefined') {
        connection.dispatcher.pause();
    }
    throw `Music player is not connected to a voicechannel.`;
}
function ResumeCurrentPlayer(connection) {
    console.log(connection.dispatcher.paused);
    if (typeof connection.dispatcher != 'undefined' && connection.dispatcher.paused === true) {
        connection.dispatcher.resume();
    }
}
function AddSongToQueue(song, serverQueue) {
    serverQueue.songs.push(song);
    console.log(serverQueue.songs);
}
function PlaySong(song, connection) {
    connection.playArbitraryInput(song);
}
function PlayCommand(message,serverQueue){

}
//#endregion
//#region PlayFromYoutube
async function execute(message, serverQueue) {
    const args = message.content.split(' ');
    var songID;
    var isPlaylist = false;
    const voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) return message.channel.send('You need to be in a voice channel to play music!');
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        return message.channel.send('I need the permissions to join and speak in your voice channel!');
    }

    var playListCheck = /\b(list=)/i;
    var linkCheck = /\b(youtube.com|youtu.be)/i;
    if (!linkCheck.test(args[1])) {
        var opts = { maxResults: 1, key: Authorization.getYoutubeApi, type: 'video,playlist' }
        var search = args.slice(1);
        var searchResult;
        search = search.join(" ");
        YoutubeSearch(search, opts, function (error, result) {
            searchResult = result[0];
        });
        await Sleep(1000);
        songID = searchResult.id;
        if (searchResult.kind === 'youtube#playlist') {
            isPlaylist = true;
            songID = `https://www.youtube.com/playlist?list=${songID}`;
        }
        if (searchResult.totalResults === 0) {
            return message.channel.send("Couldn't find the queried video.");
        }
    }
    else if (playListCheck.test(args[1])) {
        isPlaylist = true;
        songID = args[1];
    }
    else {
        songID = args[1];
    }
    if (isPlaylist) {
        AddPlaylistToQueue(songID, message);
    }
    else {
        const song = await GetYoutubeLinkInfo(songID);
        message.channel.send(`Playing \`${song.title}\`...`);
        if (!serverQueue) {
            CreateQueueandPlay(message, song);
        } else {
            QueueSong(song, serverQueue);
            return message.channel.send(`\`${song.title}\` has been added to the queue!`);
        }
    }

}

async function AddPlaylistToQueue(playlistUrl, message) {
    var playlist;
    await YoutubePlaylist(playlistUrl, ['url', 'name']).then(res => {
        playlist = res.data.playlist;
        console.log(playlist);
    });
    if (typeof Queue.get(message.guild.id) === 'undefined') {
        CreateQueueandPlay(message, await GetYoutubeLinkInfo(playlist[0].url));
        playlist = playlist.splice(1);
    }
    const playlistQueue = Queue.get(message.guild.id);
    AsyncForEach(playlist, async (url) => {
        var song = {
            title: url.name,
            url: url.url,
        };
        QueueSong(song, playlistQueue);
        return message.channel.send(`\`${song.title}\` has been added to the queue!`);
    })
}

async function GetYoutubeLinkInfo(youtubeId) {
    const songInfo = await Ytdl.getInfo(youtubeId);
    const song = {
        title: songInfo.title,
        url: songInfo.video_url,
    };
    return song;
}

function skip(message, serverQueue) {
    if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to stop the music!');
    if (!serverQueue) return message.channel.send('There is no song that I could skip!');
    serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
    if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to stop the music!');
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
    const serverQueue = Queue.get(guild.id);

    if (!song) {
        serverQueue.voiceChannel.leave();
        Queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection.playArbitraryInput(Ytdl(song.url, { quality: "highestaudio", filter: "audioonly" }))
        .on('end', () => {
            console.log('Music ended!');
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
        .on('error', error => {
            console.error(error);
        });
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

    return serverQueue;
}

async function CreateQueueandPlay(message, song) {
    const voiceChannel = message.member.voiceChannel;
    const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true,
    };

    Queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
        var connection = await voiceChannel.join();
        queueContruct.connection = connection;
        play(message.guild, queueContruct.songs[0]);
    } catch (err) {
        console.log(err);
        Queue.delete(message.guild.id);
        return message.channel.send(err);
    }
}

function QueueSong(song, serverQueue) {
    serverQueue.songs.push(song);
    console.log(serverQueue.songs);
}

//#endregion

function ReturnDelay(startTime) {
    return Date.getTime() - startTime;
}

async function Test(message, serverQueue) {
    console.log(await Ytdl.getInfo('https://www.youtube.com/watch?v=3mUXwYx1CQs'))
    var reactionArray = ['⏯'];
    message.react('⏯');
    const connection = typeof serverQueue !== 'undefined' ? serverQueue.connection : null;
    if (connection === null) {
        return;
    }

    const filter = (reaction, user) => true;
    const collector = message.createReactionCollector(filter, {});
    collector.on('collect', r => {
        console.log(!reactionArray.includes(r.emoji.name));
        if (!reactionArray.includes(r.emoji.name)) {
            r.remove(r.users.last());
        }
        if (r.emoji.name === '⏯' && r.users.last() !== Bot.user) {
            r.remove(r.users.last());
            message.edit('run playpause command');
            PlayPause(connection, message)
        }
    });
}
//
// Initialize Discord Bot
Bot.on('ready', () => {
    Init();
    InitGuilds();
    console.log(`Logged in as ${Bot.user.tag}!`);
    Bot.fetchUser(Authorization.getAuthor).then(user => BotAuthor = user);
});
Bot.on('guildCreate', () => {
    InitGuilds();
});
Bot.on('guildMemberAdd', () => {
    InitGuilds();
});
Bot.on('message', msg => {
    // Bot will listen for messages that will start with commandstring that comes from config

    if (msg.content.substring(0, 1) == CommandString) {
        var args = msg.content.substring(1).split(' ');
        var cmd = args[0];
        var rollCheckRegex = /^\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(d)([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b$/;
        const serverQueue = Queue.get(msg.guild.id);


        args = args.splice(1);
        if (msg.channel.type === "text") {
            switch (cmd) {

                case 'ping':
                    var d = new Date();
                    var time = d.getTime();
                    msg.channel.send('pong').then(Message => { var delay = ReturnDelay(time); Message.edit('Response delay is ' + delay + ' ms.') });
                    break;
                case 'test':
                    msg.channel.send("testing").then(message => {
                        Test(message,serverQueue);
                    })
                    break;
                case 'cute':
                    var attachment = new Discord.Attachment(GetRandomImage('cute'));
                    msg.channel.send(attachment).then(Message => { CollectReactions(Message, 20000); });
                    console.log('Request made by ' + msg.author.tag);
                    break;
                case 'meme':
                    var attachment = new Discord.Attachment(GetRandomImage('meme'));
                    msg.channel.send(attachment).then(Message => { CollectReactions(Message, 20000); });
                    console.log('Request made by ' + msg.author.tag);
                    break;
                case 'nice':
                    var attachment = new Discord.Attachment(GetRandomImage('nice'));
                    msg.channel.send(attachment).then(Message => { CollectReactions(Message, 20000); });
                    console.log('Request made by ' + msg.author.tag);
                    break;
                case 'manga':
                    var attachment = new Discord.Attachment(GetRandomImage('manga'));
                    msg.channel.send(attachment).then(Message => { CollectReactions(Message, 20000); });
                    console.log('Request made by ' + msg.author.tag);
                    break;
                case 'lewd':
                case 'nsfw':
                    var attachment = new Discord.Attachment(GetRandomImage('lewd'));
                    msg.channel.send(attachment);
                    console.log('Request made by ' + msg.author.tag);
                    break;

                case 'reinit':
                    var response = Init();
                    msg.channel.send('reinitialize complete. \n' + response);
                    break;

                case 'givecoin':
                    var response = TransferCoin(msg, args[1]);
                    if (response != null) {
                        msg.reply(response);
                    }
                    break;


                case 'music':
                    var musicType = args[0];
                    var link = args[1];

                    if (musicType === 'leave') {
                        if (typeof msg.guild.me.voiceChannel !== 'undefined') {
                            msg.guild.me.voiceChannel.leave();
                            return msg.channel.send('Leaving voicechat...');
                        }
                    }
                    else if (musicType === 'link') {
                        if (msg.member.voiceChannel) {
                            msg.member.voiceChannel.join()
                                .then(connection => { // Connection is an instance of VoiceConnection
                                    try {
                                        const dispatcher = connection.playArbitraryInput(link);
                                        return msg.channel.send(`Started playing music on ${link}...`);
                                    } catch (error) {
                                        return msg.reply(`Could not resolve the stream on link.`);
                                    }

                                })
                                .catch(console.log);
                        } else {
                            msg.reply('You need to join a voice channel first!');
                        }
                    }
                    else if (musicType === 'add') {
                        if (typeof args[2] === 'undefined' || typeof link === 'undefined') {
                            return msg.channel.send("Please provide both a link and a name to use.");
                        }
                        if (Object.values(StreamLinks).includes(link)) {
                            return msg.channel.send(`This link already exists under stream links database with name '${Object.keys(StreamLinks).find(key => StreamLinks[key] === link)}'.`)
                        }
                        if (typeof StreamLinks[args[2]] !== 'undefined') {
                            return msg.channel.send("Provided name already has a link saved under it.")
                        }
                        msg.channel.send("Validating the stream link...").then(message => {
                            TestLinkandExecute(link, message, AddStreamLink, args[2]);
                        })
                        break;
                    }
                    else if (msg.member.voiceChannel) {
                        msg.member.voiceChannel.join()
                            .then(connection => { // Connection is an instance of VoiceConnection
                                try {
                                    const dispatcher = connection.playArbitraryInput(StreamLinks[musicType]);
                                    dispatcher.on('error', err => { console.log(err.message) })
                                    return msg.reply(`Started playing ${musicType} stream...`);
                                } catch (error) {
                                    return msg.reply(`Invalid music type. Available musictypes: ${Object.keys(StreamLinks)}`);
                                }

                            })
                            .catch(console.log);
                    } else {
                        msg.reply('You need to join a voice channel first!');
                    }

                    break;

                case 'play':
                case 'p':
                    execute(msg, serverQueue);
                    break;
                case 'skip':
                case 's':
                    skip(msg, serverQueue);
                    break;
                case 'stop':
                    stop(msg, serverQueue);
                    break;
                case 'pause':
                    PauseCurrentPlayer(serverQueue.connection);
                    break;
                case 'resume':
                    ResumeCurrentPlayer(serverQueue.connection);
                    break;


                case 'do a flip':
                    msg.channel.send('flips u r mather xD');
                    break;
                case 'bruh':
                    msg.channel.send(GetBruhState());
                    break;
                case 'shutdown':
                    msg.channel.send('okay :(');
                    Bot.destroy();
            }
        }

        if (rollCheckRegex.test(cmd)) {
            msg.channel.send(RollDices(cmd));
        }
    }
    if (msg.channel.type === "dm") {
        if (msg.author === LastDMUser) {
            LastDM.edit(`${LastDM.content}\`\`\`${msg.content}\`\`\``);
        }
        else if (msg.author != Bot.user) {
            BotAuthor.createDM().then(channel => channel.send(`${msg.author.tag} has DM'd me these messages : \`\`\`${msg.content}\`\`\``).then(message => LastDM = message));
            LastDMUser = msg.author;
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
    if (msg.author != Bot.user && msg.attachments.size > 1 && AcceptedImageExtensions.includes(msg.attachments.first().filename.split('.')[1])) {
        CollectReactions(msg, 20000);
    }
    if (msg.content === 'Save this image^') {
        msg.channel.fetchMessages({ limit: 1, before: msg.id })
            .then(message => {
                if (message.first().attachments.size === 0) {
                    msg.channel.send("That's not an image that I can save!");
                }
                else {
                    var messageAttachments = message.first().attachments;
                    var saveChannel = Bot.channels.get("629578376088256512");
                    messageAttachments.forEach(messageAttachment => {
                        saveChannel.send({ file: messageAttachment.url });
                        msg.channel.send("Done!");
                    });
                }
            })
            .catch(console.error);
    }
    if (msg.content === 'awoo') {
        msg.reply('awoo!')
    }
});


process.on('uncaughtException', function (err) {
    BotAuthor.createDM().then(channel => channel.send(`Bot died with exception: ${err}`));
    Bot.destroy();
});

Bot.login(Authorization.getToken());