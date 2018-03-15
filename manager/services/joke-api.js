const request = require('request')

class AzureJoke {

    constructor() {
        this._endpoint  = process.env.JOKES_ENDPOINT
    }

    get() {
        return new Promise((resolve, reject) => {
            request(this._endpoint, function (error, response, body) {
                if(error){
                    reject(error);
                }else{
                    resolve(body);
                }
                
            });
        })
         
    }
}

module.exports = AzureJoke