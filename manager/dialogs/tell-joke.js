const builder = require('botbuilder')
const AzureJoke = require('../services/joke-api')

module.exports = [
    (session, args, next) => {
        const options = {
            listStyle: builder.ListStyle.button,
            retryPrompt: 'Deculpa, não entendi, selecione uma das opções'
        }
        builder.Prompts.choice(
            session,
            'Posso contar uma piada aleatória?',
            ['Sim', 'Não'],
            options
        )
    },
    (session, results) => {
        switch(results.response.index){
            case 1://não
                session.send('Ok.')
                break
            default://sim
                callJoke(session)
                break
        }
    }
]

callJoke = (session) =>{
    var joke = new AzureJoke()
    joke.get().then((resp)=>{
        session.send(`**${JSON.parse(resp).joke}**`)
    }).catch((resp)=>{
        descreverError(resp, session)
    });
}

const descreverError = (error, session) => {    
    let errorMessage = 'Opa, algo deu errado. Tente novamente depois.'
    if(error.message && error.message.indexOf('Access denied') > -1)
        errorMessage += '\n' + error.message
    session.send(errorMessage)    
}