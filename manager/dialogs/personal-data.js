const builder = require('botbuilder')
var config = require('../../config/config')

module.exports = [
    (session, args, next) => {
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
    }
]
