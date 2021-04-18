const Discord = require('discord.js');
var wsconnected = false;
const cheerio = require('cheerio');
const bot = new Discord.Client();
const express = require('express');
const path = require('path');
var startedmessage;
var answermessage;
const http = require('http');
const fs = require("fs");
const key = JSON.parse(fs.readFileSync('data/keys.json', 'utf8'));
const accounts = JSON.parse(fs.readFileSync('data/accounts.json', 'utf8'));
const qdb = JSON.parse(fs.readFileSync('data/qdb.json', 'utf8'));
var CryptoJS = require("crypto-js");
const unirest = require('unirest');
const google = require('google');
var Promise = require("bluebird");
var randomNumber = require("random-number-csprng");
const Twitter = require('twitter');
const twitterbot = new Twitter({
  consumer_key: "P1e204aWcE6Bxh3Vk5jBPtTu4",
  consumer_secret: "0pjwwXu6OhGNyPetE0UAB8eNSkMHY9TXdNhwdfX2VnneAqB1pm",
  access_token_key: "1085332165045432320-IYTafm8SgbHDuoPEB7zTCH3vOYfCP7",
  access_token_secret: "tMLkI4lOiJ6mbzl1fx78qIYc6JrqYfcy1ofT6YkoP4BRx"
});
const app = express();
var server = app.listen(4000, function(){
  console.log("Listening on port 4000")
});
//site
app.get("/", (request, response) => {
  response.sendFile(path.join(__dirname + '/public/html/index.html'))
}); 
/*routing for api
app.use('/api/discord', require('./api'));
//api eror catching
app.use((err, req, res, next) => {
  switch (err.message) {
    case 'NoCodeProvided':
      return res.status(400).send({
        status: 'ERROR',
        error: err.message,
      });
    default:
      return res.status(500).send({
        status: 'ERROR',
        error: err.message,
      });
  }
});
*/
//static files
app.use(express.static('public'))
const socket = require("socket.io")
//socket setup
var io = socket(server);
//socketio
io.on("connection", function(socket){
  console.log("made socket connection", socket.id);
  socket.on("authentication", function(authdata) {
    console.log("auth request recieved");
    console.log(authdata.id);
    var userid = decodeURIComponent(authdata.id.toString());
    var bytes  = CryptoJS.AES.decrypt(userid, '5knmPMZBPa8ddVpK');
    var decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    console.log(typeof decryptedData);
    console.log("user id: " + decryptedData);
    if (accounts[decryptedData].key) {
      io.emit('authenticated', {
        authenticated: true
      });
      console.log("emit!");
      socket.on('chat', function(data){
        // console.log(data);
        io.sockets.emit('chat', data);
      });
      socket.on('questionnumber', function(data){
        // console.log(data);
        io.sockets.emit('questionnumber', data);
      });
      socket.on('questionended', function(data){
        // console.log(data);
        io.sockets.emit('questionended', data);
      });
      socket.on('question', function(data){
        // console.log(data);
        io.sockets.emit('question', data);
      });
      socket.on('messagefeed', function(data){
        // console.log(data);
        io.sockets.emit('messagefeed', data);
      });
    }
    else if (accounts[decryptedData] && !(accounts[decryptedData].key)) {
      io.emit('authenticated', {
        authenticated: 'nokey'
      });
    } else {
      io.emit('authenticated', {
        authenticated: false
      });
    }
    socket.on('authenticated', function(data){
      // console.log(data);
      io.sockets.emit('authenticated', data);
    });
  });
})
//WebSocket
const WebSocket = require('ws');
const request = require('request')
// v this line below has no errors glitch is just being yag v
const talkedRecently = new Set();
//config file
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
//weighted servers
const weights = JSON.parse(fs.readFileSync('data/weights.json', 'utf8'));
//FINDS IndexOf minimum in an array
function indexOfMin(a) {
  var lowest = 0;
  for (var i = 1; i < a.length; i++) {
    if (a[i] < a[lowest]) lowest = i;
  }
  return lowest;
}
//FINDS IndexOf maximum in an array
function indexOfMax(arr) {
  if (arr.length === 0) {
    return -1;
  }
  var max = arr[0];
  var maxIndex = 0;
  for (var i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
    }
  }
  return maxIndex;
  console.log(maxIndex);
}
const regExpression = new RegExp("(def|obv|not|w|went)?\\s*(\\d+)\\s*(\\?*|def|obv|apg|apb)?", "i");
var questionnumber = 0;
//used in eval command
function clean(text) {
  if (typeof(text) === "string") {
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@553983197378117635" + String.fromCharCode(8203));
  } else {
    return text;
  }
}
function getModValue(modifier) {
  if (modifier == "?") {
    return 5;
  } else if (modifier == "??") {
    return 2;
  } else if (modifier == "???") {
    return 1;
  } else if (modifier == "") {
    return 9;
  } else {
    return 18; 
  };
};
var correctanswer;
function solvewithws(message,data,istest) {
  var disclaimertest="";
  if (istest==true) {
    disclaimertest="Test...\n"
  }else {
  }
  var sum;
  google.resultsPerPage = 25
  io.emit('questionended', { questionended:config.countdownactive});
  console.log('Recieved data')
  console.log(`Question: ${data.question}`)
  console.log(`Choice 1: ${data.answers[0].text}`)
  console.log(`Choice 2: ${data.answers[1].text}`)
  console.log(`Choice 3: ${data.answers[2].text}`)
  config.countdownactive = true;
  gametype = "HQ Trivia";
  channelstouse = config.hqchannels;
  config.answers = [0,0,0];
  io.emit('chat', {
    answers: config.answers
  });
  io.emit('question', { question:data.question });
  io.emit('questionnumber', { questionnumber:data.questionNumber });
  var goodgoogle = `[${data.question}](${('https://google.com/search?q='+data.question+' inanchor:"'+data.answers[0].text+'"'+'OR'+' inanchor:"'+data.answers[1].text+'"'+'OR'+' inanchor:"'+data.answers[2].text+'"').replace(/ /g,"%20")})`
  var googlelin = "["+data.question+"]("+("https://google.com/search?q="+data.question).replace(/ /g,"%20")+")";
  var googlelink = "Google Link: ["+data.question+"]("+("https://google.com/search?q="+data.question).replace(/ /g,"%20")+")";
  var binglink = "Bing Link:["+data.question+"]("+("https://bing.com/search?q="+data.question).replace(/ /g,"%20")+")";
  var cleanbing = "[Bing]("+("https://bing.com/search?q="+data.question).replace(/ /g,"%20")+")"
  var twitgooglelink = ("https://google.com/search?q="+data.question).replace(/ /g,"%20")
  var twitbinglink = ("https://bing.com/search?q="+data.question).replace(/ /g,"%20")
  var googleinline1= "["+data.answers[0].text+"]("+("https://google.com/search?q="+data.question+' inanchor:"'+data.answers[0].text+'"').replace(/ /g,"%20")+")";
  var googleinline2= "["+data.answers[1].text+"]("+("https://google.com/search?q="+data.question+' inanchor:"'+data.answers[1].text+'"').replace(/ /g,"%20")+")";
  var googleinline3= "["+data.answers[2].text+"]("+("https://google.com/search?q="+data.question+' inanchor:"'+data.answers[2].text+'"').replace(/ /g,"%20")+")";
  var binginline1= "[Bing]("+("https://bing.com/search?q="+data.question+' inanchor:"'+data.answers[0].text+'"').replace(/ /g,"%20")+")";;
  var binginline2= "[Bing]("+("https://bing.com/search?q="+data.question+' inanchor:"'+data.answers[1].text+'"').replace(/ /g,"%20")+")";;
  var binginline3= "[Bing]("+("https://bing.com/search?q="+data.question+' inanchor:"'+data.answers[2].text+'"').replace(/ /g,"%20")+")";;
  startedmessage = {embed: {
    color: 0xffae24,
    title: `Fetch Started For HQ Trivia Question ${data.questionNumber}/${data.questionCount}`,
    description:`${goodgoogle} **|** ${cleanbing}`,
    fields: [{
      name:"Answer 1 Links:",
      value: `${googleinline1} **|** ${binginline1}`
    },
             {
               name:"Answer 2 Links:",
               value: `${googleinline2} **|** ${binginline2}`               },
             {
               name:"Answer 3 Links:",
               value: `${googleinline3} **|** ${binginline3}`               
               }
            
            ]
  }};
  if (istest != true) {
  let status = {
    status:`${disclaimertest} Search Started For HQ Trivia Question ${data.questionNumber}/${data.questionCount} \n ${googlelin} \n${googleinline1}\n${googleinline2}\n${googleinline3}`
  }
  twitterbot.post('statuses/update', status, function(error, tweet, response) {
    if (!error) {
      console.log(tweet);
    }
  });
  }
  message.channel.send(startedmessage);
  setTimeout(() => {
    if (istest != true) {
    }
    config.countdownactive = false;
    config.answers[0] = Math.floor(config.answers[0])
    config.answers[1] = Math.floor(config.answers[1])
    config.answers[2] = Math.floor(config.answers[2])
    console.log(config.answers)
    if (data.question.toLowerCase().includes(" not ")) {
      config.questionanswer = [-(config.questionanswer[0]),-(config.questionanswer[1]),-(config.questionanswer[2])]
    }
    sum = config.answers.map(function (num, idx) {
      return num + config.questionanswer[idx];
    });
    var indexOfAnswersMin = indexOfMin(sum);
    var indexOfAnswersMax = indexOfMax(sum);
    correctanswer = sum[indexOfAnswersMax]
    if (istest =! true) {
    var status = {
      status: `${disclaimertest} Results for @HQTrivia Question ${data.questionNumber}/${data.questionCount}:\n\n*${data.question} \n\n ${data.answers[0].text}: ${sum[0]} \n\n ${data.answers[1].text}: ${sum[1]} \n\n ${data.answers[2].text}: ${sum[2]}\n\n Most likely answer is ${data.answers[indexOfAnswersMax].text}` 
    }
    twitterbot.post('statuses/update', status, function(error, tweet, response) {
      if (!error) {
        console.log(tweet);
      }
    });
    }
    console.log(indexOfAnswersMin);
    console.log(indexOfAnswersMax);
    markeddownAnswers =sum;
    markeddownAnswers[indexOfAnswersMin] = `~~${markeddownAnswers[indexOfAnswersMin]}~~`
    markeddownAnswers[indexOfAnswersMax] = "```py\n" + markeddownAnswers[indexOfAnswersMax] + "```"
    answermessage = {embed: {
      color: 0xFF567C,
      title: "Fetch Ended",
      description: `Results for HQ Trivia Question ${data.questionNumber}/${data.questionCount}:\n\n*${data.question}*`,
      fields: [{
        name: `${data.answers[0].text}`,
        value: markeddownAnswers[0]
      },
               {
                 name: `${data.answers[1].text}`,
                 value: markeddownAnswers[1]
               },
               {
                 name: `${data.answers[2].text}`,
                 value: markeddownAnswers[2]
               }
              ],
    }};
    message.channel.send(answermessage)
    message.channel.send("Non-Crowdsource Answers Alone: \n Answer 1: "+config.questionanswer[0] + "\n Answer 2: "+config.questionanswer[1]+"\n Answer 3: "+config.questionanswer[2]);
    message.channel.send("%hq \n Answer 1: "+config.answers[0] + "\n Answer 2: "+config.answers[1]+"\n Answer 3: "+config.answers[2]);                    
    config.questionanswer = [0,0,0]
    var nextCounter = 0
    }, 5900);
  var nextCounter = 0
  console.log("before google");
  google.resultsPerPage = 25;
  console.log(data.question);
  google(data.question, function (err, res){
    console.log('googled');
    if (err) {console.error(err) 
              config.questionanswer=[0,0,0]
              return err;}
    for (var i = 0; i < res.links.length; i++) {
      var link = res.links[i];
      console.log(link);
      if (link.title.includes(data.answers[0].text)) {config.questionanswer[0]+=3}
      if (link.title.includes(data.answers[1].text)) {config.questionanswer[1]+=3}
      if (link.title.includes(data.answers[2].text)) {config.questionanswer[2]+=3}
      if (link.description.includes(data.answers[0].text)) {config.questionanswer[0]+=1}
      if (link.description.includes(data.answers[1].text)) {config.questionanswer[1]+=1}
      if (link.description.includes(data.answers[2].text)) {config.questionanswer[2]+=1}
    }
    if (nextCounter < 1) {
      nextCounter += 1
      if (res.next) res.next()
    }
    res.links.forEach(link => {
      var finallink = link.href;
      request(finallink, function(err, resp, html) {
        if (!err){
          if (html.includes(data.answers[0].text)) {config.questionanswer[0]+=1
                                                    console.log("scraper" + config.questionanswer)}
          if (html.includes(data.answers[1].text)) {config.questionanswer[1]+=1
                                                    console.log("scraper" + config.questionanswer)}
          if (html.includes(data.answers[2].text)) {config.questionanswer[2]+=1
                                                   console.log("scraper" + config.questionanswer)}
        }
      });
    });
    if (nextCounter < 3) {
      nextCounter += 1
      if (res.next) res.next()
    } 
  })
}
var gametype;
var timer;
var channelstouse;
var gamestarted = false;
var fetchargs;
var questiontimeout = true;
var wsstarted = false;
var markeddownAnswers;
//logs when bot is ready
bot.on("ready", () => {
  console.log("Online!");
});
/*
[------------------------------------------------------------------------------------------------------------------------------------------------------------------------]
[BOT CLIENT 1]
[RUNS UNTER TOKEN AT config.token]
[FETCHES VALUES FROM SERVERS]
[------------------------------------------------------------------------------------------------------------------------------------------------------------------------]
*/
//on message
bot.on('553983197378117635', (message) => {
  var matchedMessage = regExpression.exec(message.content);
  //Apply the regex expression to the incoming message
  var checkfor = []
  if (config.countdownactive == true) {
    if (message.guild.id == "553983197378117635") {
 console.log(message.content)
        var matchedMessage = regExpression.exec(message.content);
console.log(matchedMessage)
 }
  if (gametype=="HQ Trivia") {
    checkfor = ["hq","cold","hq trivia"]
  }
   else if (gametype=="Cash Show") {
    checkfor = ["cs","cashshow","cash-show"]
  } else if (gametype=="Joyride") {
    checkfor = ["jr","cold","joyride"]
  }else if (gametype=="SwagIQ") {
    checkfor = ["swag","cold","siq"]
  }else if (gametype=="Arena") {
    checkfor = ["arena","cold","aren"]
  }else if (gametype=="Confetti") {
    checkfor = ["cf","confeti","confetti"]
  }else if (gametype=="Hypsports") {
    checkfor = ["hs","hyp","hypsports"]
  }else if (gametype=="Hangtime") {
    checkfor = ["ht","hang","hangtime"]
  }else if (gametype=="Out of Tune") {
    checkfor = ["oot","out-of-tune","tune"]
  }else if (gametype=="Words With Friends") {
    checkfor = ["wwf","words","friends"]
  }else {
  console.log(gametype)
  }
  }

  if (matchedMessage !== null && !(talkedRecently.has(message.author.id)) && config.countdownactive === true && ((message.channel.name.toLowerCase().includes(checkfor[0])||message.channel.name.toLowerCase().includes(checkfor[1])||message.channel.name.toLowerCase().includes(checkfor[2])) || config.globalchannels.includes(message.channel.id))) {
    //If the message matches
    console.log(matchedMessage);
    var newMatch = matchedMessage.splice(1, 3);
    console.log("New Match: " + newMatch);
    //Select for important aspects (modifier before, referenced answer, and modifier after)
    var invert = false;
    var referencedAnswer = newMatch[1];
    if (!(newMatch[0] === undefined)) {
      console.log("If statement triggered");
      if (newMatch[0].toLowerCase() == "not") {
        invert = true; //:thinking:
      } else if (newMatch[0].toLowerCase() == "w" || newMatch[0].toLowerCase() == "went") {
        return;
      };
    };
    if (!(0 < newMatch[1] && newMatch[1] < 4)) {
      return;
    };
    if (newMatch[0] === undefined && newMatch[2] === undefined) {
      var modifier = "";
    } else if (newMatch[0] === undefined) {
      modifier = newMatch[2];
    } else if (newMatch[2] === undefined && !(newMatch[0] == 'not')) {
      modifier = newMatch[0];
    } else {
      modifier = "";
    };
    var answerIndex = parseInt(newMatch[1]) - 1;
    var weighted = false;
    //calculate if a user is weighted and add its appropiate weight
    for (var i = 0; i < weights.weightedUsers.length; i++) {
      console.log(weights.weightedUsers[i].id);
      console.log(message.author.id)
      if (weights.weightedUsers[i].id === message.author.id) {
        var weightMultiplierUsers = weights.weightedUsers[i].weight;
        weighted = false;
      } else {
        var weightMultiplierUsers = 1
        weighted = false
      }
   }
    if (weighted === false) {
     // calculate if a server is weighted and add its appropiate weight
      for (var i = 0; i < weights.weightedServers.length; i++) {
        if (weights.weightedServers[i].id === message.guild.id) {
          var weightMultiplierServers = weights.weightedServers[i].weight;
          weighted = false;
          break;
        } else {
          var weightMultiplierServers = 1
          weighted = false
        }
      }
    }
    var modvalue = Number((getModValue(modifier) * weightMultiplierServers * weightMultiplierUsers).toFixed(1));
    var readable = Math.floor(modvalue);
    if (invert) {
      config.answers[answerIndex] = config.answers[answerIndex] - readable;
    } else {
      config.answers[answerIndex] = config.answers[answerIndex] + readable;
    };
    console.log(config.answers);
    talkedRecently.add(message.author.id);
    io.emit('chat', {
      answers: config.answers
    });
    setTimeout(() => {
    //   Removes the user from the set after 5 secs
      talkedRecently.delete(message.author.id);
    }, 5000);
  } 
});
bot.login(config.token);
//gotrivia
const gotoken = new Discord.Client(); 
gotoken.login(config.gotriviatoken);
gotoken.on("ready", () => {
  console.log("gotrivia Online!");
  console.log(gotoken.guilds.map(g=>g.name).join("\n"));
});
/*
[------------------------------------------------------------------------------------------------------------------------------------------------------------------------]
[BOT CLIENT 2]
[RUNS UNTER TOKEN AT config.token2]
[RECIEVES VALUES FROM CLIENT 1 AND DISPLAYS IN CHANNEL]
[------------------------------------------------------------------------------------------------------------------------------------------------------------------------]
*/
const client = new Discord.Client();
client.login(config.token2);
client.on("ready", () => {
  console.log("bot 2 Online!");
  client.user.setgame(`Codes Server.`,'https://www.twitch.tv/fofodiscord');
  
});
client.on('553983197378117635', message => {
  if (message.content.includes("?kick")) {
    message.channel.send("oof bai", {files: ["https://media0.giphy.com/media/3o7524XSThht3fx7Yk/giphy.gif"]})
  }
  if (message.content.includes("?mute")) {
    message.channel.send("now he can shh, finally. I was listening to my chill spotify playlist", {files: ["https://media2.giphy.com/media/3o752cuysSwyUlK7mM/giphy.gif"]})
  }
  if (message.content.includes("?ban")) {
    message.channel.send("bad bois bad bois. Whachu finna do", {files: ["https://media.giphy.com/media/xUOxf4hYse3e8vrRcI/source.gif"]})
  }
  if (message.channel.id == "559541095298498581" && message.author.id !== "553983197378117635") {
    io.emit('messagefeed', {
      messagefeed: message.author.tag + ": "+ message.content
    });
  }
  /*
  //send messages from trivia farm over to the cold hard trivia channel
   if (message.channel.id === "456273162200678402" || message.channel.id === "456273162200678402"|| message.channel.id === "456273162200678402"&& message.author.id !== "475339268458414090") {
    message.guild.fetchWebhooks().then(webhook => {
      var logger = webhook.get("554706451743113228")
      logger.send('', {
        "username": message.author.username,
        "avatarURL": message.author.avatarURL,
        "text" : message.content
      })
    })
  }
  */
  //checks if message starts with prefix
  if (message.content.startsWith(config.prefix)) {
    //slices args and command away from prefix
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    console.log(command);
    console.log(args)
    //help command
    let FetcherRole = message.guild.roles.get("553983197378117635");
    let DevRole = message.guild.roles.get("553983197378117635");
    let EarlyBirdRole = message.guild.roles.get("553983197378117635");
    let VeryEarlyBirdRole = message.guild.roles.get("553983197378117635");
    let VeryVeryEarlyBirdRole = message.guild.roles.get("553983197378117635");
    let BetaBenefactorRole = message.guild.roles.get("553983197378117635");
    let HeadFetcherRole = message.guild.roles.get("553983197378117635");
    let EarlyUpvoteRole = message.guild.roles.get("553983197378117635");
    let InsomniacBirdRole = message.guild.roles.get("549979932533587969");
    const keys = JSON.parse(fs.readFileSync('data/keys.json', 'utf8'));
    if (command === '!help') {
      message.channel.send({embed: {
        color: 0x2DF00F,
        title: "Help Command",
        description: `Info on all the commands CHT has to offer`,
        fields: [{
          name: "!ping",
          value: "Pings bot and checks response time"
        },
                 {
                   name: "!fetch [hq/cs/jr/swag/arena/confetti/hypsports/hangtime/oot/wwf]",
                   value: "[FETCHER ONLY] Begins to fetch from server for game in progress, specifying a new game will reset the command"
                 },
                 {
                   name: "!upvote",
                   value: "Checks if you upvoted CHT on triviago and adds a special role"
                 },
                 {
                   name: "!cost",
                   value: "Calculates bot price including all of our discounts."
                 },
                 {
                   name: "!eval <code>",
                   value: "[DEV ONLY] Evaluates code"
                 },
                 {
                   name: "!say <text>",
                   value: "[DEV ONLY] Says something as the bot"
                 },
                 {
                   name: "!autohq [us/uk] [override(overrides double connect protection. Please do not use unless nessacary )]",
                   value: "[FETCHER ONLY] Connects to either the us or uk websocket for hq"
                 },
                 {
                   name: "!key [create/redeem <key>]",
                   value: "[DEV ONLY] (create) Creates an access key for CHT.\n(redeem) Redeems an access key for CHT"
                 }
                ],
      }});
      //startfetching command
    } else if (command === "key") { 
      //selectors [create [dev only]/redeem <key>]
      if (args[0] === "create") {
        if (message.member.roles.has(DevRole.id)) {
          Promise.try(function() {
            return randomNumber(1000000000, 9999999999);
          }).then(function(number) {
            var code2 = number.toString().slice(5)
            var code1 = number.toString().substring(0,5)
            const newKey = (code1 + "-" + code2)
            keys.validKeys.push(newKey)
            fs.writeFileSync('data/keys.json', JSON.stringify(keys));
            message.author.send({embed: {
              color: 3447003,
              title: `Key Made!`,
              description: `Key code: ${newKey}`
            }});            
          }).catch({code: "RandomGenerationError"}, function(err) {
            console.log("Something went wrong!");
          });
        } else {
          message.channel.send("Only developers can create bot keys!") 
        }
      } else if (args[0] === "redeem") {
        if (args[1]) {
          if (keys.validKeys.includes(args[1])) {
            if (!accounts[message.author.id]) {
              var index = keys.validKeys.indexOf(args[1]);
              if (index > -1) {
                keys.validKeys.splice(index, 1);
                keys.usedKeys.push(args[1])
                fs.writeFileSync('data/keys.json', JSON.stringify(keys));
                accounts[message.author.id] = {}
                accounts[message.author.id].key = args[1]
                fs.writeFileSync('data/accounts.json', JSON.stringify(accounts));
                console.log(keys)
                message.member.addRole(EarlyBirdRole);
                message.channel.send({embed: {
                  color: 3447003,
                  title: `Thank you for purchasing TT!!`,
                  description: `You now have the Insomniac Bird role and access to the bot!`
                }});       
              }
            } else if (accounts[message.author.id] && !(accounts[message.author.id].key)){
              var index = keys.validKeys.indexOf(args[1]);
              if (index > -1) {
                keys.validKeys.splice(index, 1);
                keys.usedKeys.push(args[1])
                fs.writeFileSync('data/keys.json', JSON.stringify(keys));
                accounts[message.author.id].key = args[1]
                fs.writeFileSync('data/accounts.json', JSON.stringify(accounts));
                console.log(keys)
                message.member.addRole(EarlyBirdRole);
                message.channel.send({embed: {
                  color: 3447003,
                  title: `Thank you for purchasing TT!!`,
                  description: `You now have the Insomniac Bird role and access to the bot!`
                }});       
              }
            } else {message.channel.send("This account already has a key linked to it.") }
          } else if (keys.usedKeys.includes(args[1])) {
            message.channel.send("This key has already been used!")
          } else {
            message.channel.send("That is not a valid key code.")
          }
        } else {
          message.channel.send("Please include the key code you would like to redeem.") 
        }
      } else {
        message.channel.send("Command Usage: `!key [[DEV ONLY]create/redeem <key>]`") 
      }
    } else if (command === "announce" && message.member.roles.has(DevRole.id)) {
      var announce = args.join(" ") //it wasnt working before so i fixed this part and it still wont work
      if (!args[0]) {
        message.channel.send("Do !announce (message) to announce something on the website")
      } else {
        io.emit('chat', {
          announcement: announce
        });
        message.channel.send({embed: {
          color: 3447003,
          title: `Announcement Made!`,
          description: announce
        }});
      }
    } else if (command.startsWith('fetch')) {
      if (message.member.roles.has(FetcherRole.id)) {
        config.answers = [0, 0, 0];
        console.log("!fetch detected!"); 
        //hq trivia
        if (args[0] === 'hq') {
          questionnumber = 0;
          gametype = "HQ Trivia"
          message.channel.send({embed: {
            color: 3447003,
            title: `Started a new game of ${gametype}`
          }});
          gamestarted = true;
          channelstouse = config.hqchannels
          timer = 7000
          //cash show
        } else if (args[0] === 'cs') {
          questionnumber = 0;
          gametype = "Cash Show"
          message.channel.send({embed: {
            color: 3447003,
            title: `Started a new game of ${gametype}`
          }});
          gamestarted = true;
          channelstouse = config.cschannels
          timer = 5700
          //joyride
        } else if (args[0] === 'jr') {
          questionnumber = 0;
          gametype = "Joyride"
          message.channel.send({embed: {
            color: 3447003,
            title: `Started a new game of ${gametype}`
          }});
          gamestarted = true;
          channelstouse = config.jrchannels
          timer = 6200
          //swag
        } else if (args[0] === 'swag') {
          questionnumber = 0;
          gametype = "SwagIQ"
          message.channel.send({embed: {
            color: 3447003,
            title: `Started a new game of ${gametype}`
          }});
          gamestarted = true;
          channelstouse = config.swagchannels
          timer = 7000
          //arena
        } else if (args[0] === 'arena') {
          questionnumber = 0;
          gametype = "Arena"
          message.channel.send({embed: {
            color: 3447003,
            title: `Started a new game of ${gametype}`
          }});
          gamestarted = true;
          channelstouse = config.arenachannels
          timer = 6000
        }else if(args[0] ==='confetti') {
                  questionnumber = 0;
          gametype = "Confetti"
 message.channel.send({embed: {
            color: 3447003,
            title: `Started a new game of ${gametype}`
          }});
        gamestarted = true;
          timer = 7000
        } else if (args[0] ==='hypsports') {
          questionnumber = 0;
            gametype = "Hypsports"
message.channel.send({embed: {
            color: 3447003,
            title: `Started a new game of ${gametype}`
          }});
        gamestarted = true;
          timer = 7000
        }else if (args[0] ==="hangtime") {
               questionnumber = 0;
            gametype = "Hangtime"
message.channel.send({embed: {
            color: 3447003,
            title: `Started a new game of ${gametype}`
          }});
        gamestarted = true;
          timer = 7000
        }else if (args[0]=="oot"){
        questionnumber = 0;
            gametype = "Out of Tune"
message.channel.send({embed: {
            color: 3447003,
            title: `Started a new game of ${gametype}`
          }});
        gamestarted = true;
          timer = 7000
        }else if (args[0]=="wwf"){
        questionnumber = 0;
            gametype = "Words With Friends"
message.channel.send({embed: {
            color: 3447003,
            title: `Started a new game of ${gametype}`
          }});
        gamestarted = true;
          timer = 7000
        }
        config.countdownactive = true;
        console.log(args[0])
        console.log(gamestarted)
        if (!(args[0]) && gamestarted === false) {
          questionnumber = 0;
          message.channel.send({embed: {
            color: 3447003,
            title: `No game in progress, defaulting to HQ Trivia`
          }}); 
          gametype = "HQ Trivia"
          message.channel.send({embed: {
            color: 3447003,
            title: `Started a new game of ${gametype}`
          }});
          channelstouse = config.hqchannels
          timer = 7000
          gamestarted = true;
        }
        questionnumber++;
        io.emit('questionnumber', {questionnumber:questionnumber});
        io.emit('questionended', { questionended:config.countdownactive});
        startedmessage = {embed: {
          color: 0xffae24,
          title: `Fetch Started For ${gametype} Question ${questionnumber}`
        }}
        message.channel.send(startedmessage);
        client.user.setActivity(`${gametype}`, { 
          type: 'PLAYING',
          status: 'dnd' 
        });
        io.emit('chat', {
          answers: config.answers
        });
        setTimeout(() => {
          config.countdownactive = false;
          var indexOfAnswersMin = indexOfMin(config.answers)
          var indexOfAnswersMax = indexOfMax(config.answers)
          console.log(indexOfAnswersMin);
          console.log(indexOfAnswersMax);
          markeddownAnswers = config.answers
          console.log("monu",config.answers)
        if (config.answers != [ 0, 0,0 ]){
          markeddownAnswers[indexOfAnswersMin] = `~~${markeddownAnswers[indexOfAnswersMin]}~~`
          markeddownAnswers[indexOfAnswersMax] = "```py\n" + markeddownAnswers[indexOfAnswersMax] + "```"
        }
          answermessage = {embed: {
            color: 0xFF567C,
            title: "Fetch Ended",
            description: `Results from ${bot.guilds.size} servers for ${gametype}:`,
            fields: [{
              name: "Hits for Answer Choice 1",
              value: markeddownAnswers[0]
            },
                     {
                       name: "Hits for Answer Choice 2",
                       value: markeddownAnswers[1]
                     },
                     {
                       name: "Hits for Answer Choice 3",
                       value: markeddownAnswers[2]
                     }
                    ],
          }}
          message.channel.send(answermessage);
          console.log("Fetch ended");
        }, timer);
      } else {
        message.channel.send("This command requires the `Fetchers` role.", {files: ["https://media0.giphy.com/media/3o752eYI0qTt1Zv368/giphy.gif"]});
      }
      //iupvoted command
    } else if (command ==='iupvote') {
      const options = {  
        url: 'https://triviago.xyz/api/guild/457352813308018706/rating',
        method: 'GET',
        headers: {
          'Authorization': 'cnFXkPErVry6rEcC9y5bRkfC3fZoidGlr2n4Zf2F4TZ7cSq2Q5',
        }
      };
      request(options, function(err, res, body) {  
        let json = JSON.parse(body);
        if (json.likes.includes(message.author.id)) {
          message.member.addRole(EarlyUpvoteRole).catch(console.error);
          message.channel.send({embed: {
            color: 3447003,
            title: `You have upvoted, so I added your sick role! You now get 10% off, a new chat color, and can change your nickname!`
          }});                                        
        } else {
          message.channel.send({embed: {
            color: 3447003,
            title: `You have not upvoted. To get early upvoter perks please go to https://triviago.xyz/guild/457352813308018706. Click like then Authorize for Triviago to allow it to access your Discord info. Then click like again!`
          }});
        }
      });
    }
    //calculate cost command
    else if (command.startsWith('cost')) {
      message.channel.send({embed: {
        color: 3447003,
        title: `Calculating Bot Price...`
      }}, {files: ["https://media.giphy.com/media/l0HU0odRZiS0aYzxS/giphy.gif"]}).then(msg => {
        var discountsources = [];
        var discount = 1;
        var baseprice = 10;
        if (message.member.roles.has(VeryVeryEarlyBirdRole.id)) {
          discount -= 1
          discountsources.push('Very Very Early Bird (100% off)')
        } else if (message.member.roles.has(VeryEarlyBirdRole.id)) {
          discount -= 0.5
          discountsources.push('Very Early Bird (50% off)')
        } else if (message.member.roles.has(EarlyBirdRole.id)) {
          discount -= 0.1          
          discountsources.push('Early Bird (10% off)')
        } if (message.member.roles.has(BetaBenefactorRole.id)) {
          discount -= 0.5          
          discountsources.push('Beta Benefactor (50% off)')
        } if (message.member.roles.has(HeadFetcherRole.id)) {
          discount -= 0.25
          discountsources.push('Head Fetcher (20% off)')
        } if (message.member.roles.has(EarlyUpvoteRole.id)) {
          discount -= 0.10
          discountsources.push('Triviago Upvote (10% off)')
        }
        console.log(discount + "discount area 1 " + discountsources + "discount sources")
        var inviteamount = 0
        var invites = message.guild.fetchInvites().then(invites => {
          var sendersInvite = invites.array()
          for(var i=0; i < sendersInvite.length; i++){
            if (sendersInvite[i].inviter.id === message.author.id) {
              inviteamount += sendersInvite[i].uses
            }
          }
          console.log(inviteamount)
          if (inviteamount > 5) {
            discount -= 0.25
            discountsources.push(`Invited ${inviteamount} people to the server (25% off)`)
          } else {
            console.log("here")
            discount -= (inviteamount * 0.05)        
            discountsources.push(`Invited ${inviteamount} people to the server (${inviteamount * 5}% off)`)
            console.log(discount + "discount" + discountsources + "discount sources")
          }
          var cost = baseprice * discount;
          if (cost < 0) {
            cost = 0 
          }
          if(Math.round(cost) !== cost) {
            cost = cost.toFixed(2);
          }
          msg.edit({embed: {
            color: 3447003,
            title: `${message.author.username}'s Price: $${cost}`,
            description: discountsources.join('\n')
          }})
        })
        }); 
    } else if (command === 'ping') {
      message.channel.send("Pinging...").then(msg => {
        msg.edit(`Pong! Response timer: ${Math.round(client.ping)} milliseconds!`);
      });
      //eval command
    } else if (command.toLowerCase().startsWith('eval') && (config.devs.includes(message.author.id))) {
      const evalargs = message.content.split(" ").slice(1);
      try {
        const code = evalargs.join(" ");
        let evaled = eval(code);
        if (typeof evaled !== "string")
          evaled = require("util").inspect(evaled);
        message.channel.send(clean(evaled), {
          code: "xl"
        });
      } catch (err) {
        message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
      }
      //say command
    } else if (command.startsWith('say') && (config.devs.includes(message.author.id))) {
      var sayMessage = (message.content).replace('!say ', '');
      if (sayMessage === '!say') {
        message.channel.send("Include the message you would like me to say");
      } else {
        message.delete(1);
        message.channel.send(sayMessage);
      }
    } else if (command === ('autohq')) {
      if (wsconnected == true && args[1] != "override") {
      message.channel.send("It seems as if the game is already playing. I have prevented a double connect. If you would like to override this please type !autohq country override");
      return "alreadyconnected";
      }
      if (message.member.roles.has(FetcherRole.id) ) {
        console.log('ws call detected');
        if (args[0] === "us") {
          var bearer  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIzOTU5ODA1LCJ1c2VybmFtZSI6IlNpbXBzb24xNTkiLCJhdmF0YXJVcmwiOiJzMzovL2h5cGVzcGFjZS1xdWl6L2RhL2dyZWVuLnBuZyIsInRva2VuIjoiTFJmdEFwIiwicm9sZXMiOltdLCJjbGllbnQiOiIiLCJndWVzdElkIjpudWxsLCJ2IjoxLCJpYXQiOjE1NDMwMjI0NzIsImV4cCI6MTU1MDc5ODQ3MiwiaXNzIjoiaHlwZXF1aXovMSJ9.eDXqMVuAfge3JnneTMPXZreub3dgkVXCf5htM6RjJu0"
          } else if (args[0] === "uk") {
            var bearer  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIzOTU5ODA1LCJ1c2VybmFtZSI6IlNpbXBzb24xNTkiLCJhdmF0YXJVcmwiOiJzMzovL2h5cGVzcGFjZS1xdWl6L2RhL2dyZWVuLnBuZyIsInRva2VuIjoiTFJmdEFwIiwicm9sZXMiOltdLCJjbGllbnQiOiIiLCJndWVzdElkIjpudWxsLCJ2IjoxLCJpYXQiOjE1NDMwMjI0NzIsImV4cCI6MTU1MDc5ODQ3MiwiaXNzIjoiaHlwZXF1aXovMSJ9.eDXqMVuAfge3JnneTMPXZreub3dgkVXCf5htM6RjJu0";
          } else {
            message.channel.send({embed: {
              color: 3447003,
              title: `No country specified, defaulting to HQ Trivia US`
            }});         
            var bearer  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIzOTU5ODA1LCJ1c2VybmFtZSI6IlNpbXBzb24xNTkiLCJhdmF0YXJVcmwiOiJzMzovL2h5cGVzcGFjZS1xdWl6L2RhL2dyZWVuLnBuZyIsInRva2VuIjoiTFJmdEFwIiwicm9sZXMiOltdLCJjbGllbnQiOiIiLCJndWVzdElkIjpudWxsLCJ2IjoxLCJpYXQiOjE1NDMwMjI0NzIsImV4cCI6MTU1MDc5ODQ3MiwiaXNzIjoiaHlwZXF1aXovMSJ9.eDXqMVuAfge3JnneTMPXZreub3dgkVXCf5htM6RjJu0"
            }
        const options = {
          url: 'https://api-quiz.hype.space/shows/now',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${bearer}`
          }
        };
        request(options, function(err, res, body) {
          body = JSON.parse(body)
          console.log(body)
          if (!body.active) {
            var d = new Date(body.nextShowTime);
            var minutes = d.getUTCMinutes();
            console.log(minutes.toString().length);
            if (minutes.toString().length == 1) {minutes = minutes + "" + 0}
            var readabledate = "***"+(d.getUTCHours())+":"+minutes+ " UTC***"
            message.channel.send('Game Not Active. The next game is a ***' + body.nextGameType + '*** game. The prize will be ***' + body.upcoming[0].prize + '!*** The game is at ' + readabledate,  {files: ["https://cdn.glitch.com/710942de-7b4a-4375-9898-8203a908440b%2F2d4b8063299f738dfe938ef465948912.gif"]})
          }
          else if (body.active == true) {
            let socketUrl = body.broadcast.socketUrl
            let options = {
              headers: {
                Authorization: `Bearer ${bearer}`
              }
            }
            let ws = new WebSocket(socketUrl,options)
            ws.on('open', () => {
              console.log("Connected to websocket")
              let status = {
                status:'Ready to get some bread! Lets get this game going \n https://media.giphy.com/media/xUOxf5HXpw5flSuGOI/source.gif'
              }
              twitterbot.post('statuses/update', status, function(error, tweet, response) {
                if (!error) {
                  console.log(tweet);
                }
              });
              message.channel.send("Connected to the HQ Trivia Websocket!", {files: ["https://media.giphy.com/media/xUOxf5HXpw5flSuGOI/source.gif"]});
              client.user.setActivity(`HQ Trivia`, { 
                type: 'PLAYING',
                status: 'dnd' 
              });
              wsconnected = true;
              //Ping websocket to stay connected
              try {
                setInterval(() => { try {ws.ping()}catch(e){
                  message.channel.send("GAME OVER DID YOU WIN!");
                  wsconnected=false;
                }
                                  }, 10000)
              } catch (error) {
                console.error(error);
                wsconnected=false;
              }
            })
            ws.on('message', (data) => {
              data = JSON.parse(data)
              if(data.type=="question") {console.log(data)}
              //check if data type is a question not just like chat messages
              if (data.type=="question") {
                solvewithws(message,data,false);
              }//end
            })
          }
        })
      } else {
        message.channel.send("This command requires the `Fetchers` role.", {files: ["https://media0.giphy.com/media/3o752eYI0qTt1Zv368/giphy.gif"]});
      }
    } else if (command == "testws") {
      var timestocheck
      if (typeof args[0] != "undefined") {timestocheck = args[0]} else {timestocheck=1}
      var corrcount = [];
      for (var i = 0; i<timestocheck;i++) {
        message.channel.send("Choosing a random question from the Database");
        function getRandomInt(min, max) {
          min = Math.ceil(min);
          max = Math.floor(max);
          return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
        }
        var randomint = getRandomInt(1,1553);
        let data = {
          type: 'question',
          ts: '2018-07-25T01:04:53.926Z',
          totalTimeMs: 10000,
          timeLeftMs: 10000,
          questionId: 49711,
          question:     qdb[randomint].question,
          category: 'Culture',
          answers: 
          [ { answerId: 151244, text:qdb[randomint].answers[0].text},
           { answerId: 151245, text: qdb[randomint].answers[1].text},
           { answerId: 151246, text:qdb[randomint].answers[2].text} ],
          questionNumber: qdb[randomint].question_num,
          questionCount: 12,
          askTime: '2018-07-25T01:04:53.926Z',
          c: 6,
          sent: '2018-07-25T01:04:54.004Z' 
        }
        solvewithws(message,data,true)
        for (var i=0; i<=2;i++) {
          console.log(i+"_"+qdb[randomint].answers[i].correct)
          if (qdb[randomint].answers[i].correct == true){
            message.channel.send("The correct answer was: " +qdb[randomint].answers[i].text);
            if (qdb[randomint].answers[i].text == correctanswer) {
              corrcount.push(true)
            } else {corrcount.push(false)}
          }
        }  
      }
      function countInArray(array, value) {
        return array.reduce((n, x) => n + (x === value), 0);
      }
      /*setTimeout(findcount => {
      let instances = countInArray(corrcount,true);
      message.channel.send("Run completed! The correct count is "+instances+"/"+corrcount.length);
},10000*timestocheck)*/
    } else if (command =="ws") {
    message.channel.send("This command has moved to !autohq :smile:");
    }else if (command =="givemefetcher") {
      if(message.member.roles.has(FetcherRole.id)) {
        message.channel.send("You're already fetcher silly! :smile:")

      } else {
      message.channel.send("Giving you fetcher for 20 minutes. Abusing this command will lead to a permanent ban from CHT and all it's affiliated partner servers. The command is !fetch [hq/cs/jr/swag/arena/confetti/hypsports/hangtime/oot/wwf]")
      message.member.addRole(FetcherRole)
      setTimeout(gay=>{
        message.member.removeRole(FetcherRole)
        message.reply("Removed your fetcher role!");             
                      },1200000);
      
      }
    }
  }
})
/*
[------------------------------------------------------------------------------------------------------------------------------------------------------------------------]
[BOT CLIENT 3]
[RUNS UNTER TOKEN AT config.token3]
[RECIEVES VALUES FROM CLIENT 1 AND DISPLAYS IN Trivia OASIS]
[------------------------------------------------------------------------------------------------------------------------------------------------------------------------]
*/
const oasisbot = new Discord.Client();
//oasisbot.login(config.token4);
oasisbot.on("ready", () => {
  console.log("bot 3 Online!");
  oasisbot.user.setActivity('you cop those funkos', { 
    type: 'WATCHING',
    status: 'dnd' 
  });
  var checkformessages = setInterval(function (){ 
    if (startedmessage !== null) {
      oasisbot.guilds.get("559541095298498581").channels.get("559541095298498581").send(startedmessage);
      startedmessage = null;
    }
    if (answermessage !== null) {
      oasisbot.guilds.get("559541095298498581").channels.get("559541095298498581").send(answermessage);
      answermessage = null;
    }
  }, 1);
});
oasisbot.on('message', message => {
  if (message.content.startsWith(config.prefix)) {
    //slices args and command away from prefix
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    console.log(command);
    console.log(args)
    if (command.startsWith('say') && (config.devs.includes(message.author.id))) {
      var sayMessage = (message.content).replace('!say ', '');
      if (sayMessage === '!say') {
        message.channel.send("Include the message you would like me to say");
      } else {
        message.delete(1);
        message.channel.send(sayMessage);
      }
    }else if (command === "help") {
      message.channel.send({embed: {
        color: 3447003,
        title: "Oasisbot Commands",
        description: `Info on all the commands Oasis Trivia AI has to offer`,
        fields: [{
          name: "!say",
          value: "Says something as Oasis Trivia AI"
        }
                ]
      }});
    }
  }
})
