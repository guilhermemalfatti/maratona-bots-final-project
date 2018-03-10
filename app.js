// load env variables from the .env file
require('dotenv-extended').load()

var restify = require('restify');
var builder = require('botbuilder');
var config = require('./config/config');
 
// Setup Restify Server
const port = process.env.port || process.env.PORT || 3978
var server = restify.createServer();
server.listen(port, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector);
bot.set('storage', new builder.MemoryBotStorage())

// LUIS Dialogs 
const recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL)
const intents = new builder.IntentDialog({
    recognizers: [recognizer]
})

intents.matches('dados-pessoais', (session, args, next) =>{
    if(args.entities.length > 0){
        var message = "";
        args.entities.forEach(function(value, index){
            if(value.type == "nome"){
                if(index > 0){
                    message = message + " e "
                }
                message = message +  "Meu nome é **Bot**. ";
            }else if(value.type == 'idade'){
                var age = new Date().getTime() - config.birth_date;                
                if(index > 0){
                    message = message + " e "
                }
                message = message +  `Tenho **${age}** anos/dias de vida (formato em timestamp)`;
            }
        });
    }
    session.send(message);
});

intents.matches('saudar', (session) =>{
    session.send('Olá, em que posso lhe ajudar?');
});

intents.onDefault((session, args) => {
    session.send(`Desculpe, não pude compreender **${session.message.text}**\n\nLembre-se que sou um bot e meu conhecimento é limitado. - ${config.birth_date}`)
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