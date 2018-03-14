const builder = require('botbuilder')
const validUrl = require('valid-url')
const AzureEmotion = require('../services/azure-facial-api')
const utils = require('../utils/utils')
const config = require('../../config/config')

module.exports = [
    (session, args, next) => {
        const options = {
            listStyle: builder.ListStyle.button,
            retryPrompt: 'Deculpa, não entendi, selecione uma das opções'
        }
        builder.Prompts.choice(
            session,
            'Como você deseja enviar a imagem?',
            ['URL', 'Anexo'],
            options
        )
    },
    (session, results) => {
        switch(results.response.index){
            case 1:
                builder.Prompts.attachment(session, 'Joia, envia em ANEXO a imagem para ser avaliada')
                break
            default:
                builder.Prompts.text(session, 'Ok, envia a URL da imagem a ser analisada')
                break
        }
    },
    (session, results) => {
        const emotionServie = new AzureEmotion()
        if(utils.hasImageAttachment(session)){
            const stream = utils.getImageStreamFromMessage(session.message, utils.connector)
            emotionServie.findFromStrem(stream)
                .then(descreverSuccess(session))
                .catch(descreverError(session))
        }
        else {
            const imageUrl = utils.parseAnchorTag(session.message.text) || (validUrl.isUri(session.message.text) ? session.message.text : null)
            if(imageUrl){
                emotionServie.findFromUrl(imageUrl)
                    .then(descreverSuccess(session))
                    .catch(descreverError(session))
            }
            else {
                session.send('Não foi possivel identifcar a imagem corretamente, poderia enviar outra?.')
            }
        }
    }
]

const getScores = obj => Object.keys(obj).map(key => obj[key])
const getHighestScore = obj => Math.max.apply(null, getScores(obj))
const getMood = (obj, highestScore) => Object.keys(obj).find(key => obj[key] === highestScore)

const descreverSuccess = (session) => {
    return (result) => {
        if(!result)
            return session.send('Não consegui descrever essa imagem')
            
        var faces = [];
        const emotions = result.map((item) => {            
            var highestScore = getHighestScore(item.faceAttributes.emotion);
            var mood = getMood(item.faceAttributes.emotion, highestScore)
            faces.push({
                [item.faceId]: mood
            })            
        })
        if(faces.length > 1){
            session.send('Identifiquei mais de uma pessoa na imagem:')

            faces.map((item, index) => {
                session.send(`A pessoa **${index + 1}** esta sentindo **${config.emotions[item[Object.keys(item)]]}**`)
            })

        }else if(faces.length == 1){
            session.send('Identifiquei uma pessoa na imagem.')

            session.send(`A pessoa esta sentindo **${config.emotions[faces[0][Object.keys(faces[0])[0]]]}**`)
        }else{
            session.send('Não identifiquei nenhuma pessoa nesta imagem.')
        }

    }
}

const descreverError = (session) => {
    return (error) => {
        let errorMessage = 'Opa, algo deu errado. Tente novamente depois.'
        if(error.message && error.message.indexOf('Access denied') > -1)
            errorMessage += '\n' + error.message
        session.send(errorMessage)
    }
}