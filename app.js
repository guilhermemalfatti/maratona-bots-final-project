// load env variables from the .env file
require('dotenv-extended').load()

var restify = require('restify');
var builder = require('botbuilder');
var config = require('./config/config');
const recognizeEmotion = require('./manager/dialogs/recognize-emotion')
const tellJoke = require('./manager/dialogs/tell-joke')
const tellLastJoke = require('./manager/dialogs/tell-last-joke')
const farewell = require('./manager/dialogs/farewell')
const personalData = require('./manager/dialogs/personal-data')
var util = require('./manager/utils/utils');
 
// Setup Restify Server
const port = process.env.port || process.env.PORT || 3978
var server = restify.createServer();
server.listen(port, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Listen for messages from users 
server.post('/api/messages', util.connector.listen());

var bot = new builder.UniversalBot(util.connector);
bot.set('storage', new builder.MemoryBotStorage())

// LUIS Dialogs 
const recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL)
const intents = new builder.IntentDialog({
    recognizers: [recognizer]
})

intents.matches('dados-pessoais', personalData);

intents.matches('saudar', (session) =>{
    session.send('Olá, em que posso lhe ajudar?');
});

intents.matches('reconhecer-emocoes', recognizeEmotion);

intents.matches('identificacao-piada', tellJoke);

intents.matches('identificacao-ultima-piada', tellLastJoke);

intents.matches('despedida', farewell);

intents.onDefault((session, args) => {
    session.send(`Desculpe, não pude compreender **${session.message.text}**\n\nLembre-se que sou um bot e meu conhecimento é limitado.`)
})

bot.on('conversationUpdate', (update) => {
    if (update.membersAdded) {
        update.membersAdded.forEach( (identity) => {
            if (identity.id === update.address.bot.id) {
                bot.loadSession(update.address, (err, session) => {
                    if(err)
                        return err;                    
                    session.send("olá seja bem vindo");
                })
            }
        })
    }
})

bot.dialog('/', intents)