const builder = require('botbuilder')
const AzureJoke = require('../services/joke-api')

module.exports = [
    (session, args, next) => {
        if(session.userData.lastJoke){
            session.send("A última piada foi:")
            session.send(`**${session.userData.lastJoke}**`)
        }else{
            session.send("Não contei nenhuma piada ainda.")
        }
    }
]
