const AzureApi = require('./azure-api')

class AzureEmotion extends AzureApi {

    constructor() {
        const API_URL = `${process.env.MICROSOFT_FACIAL_API_ENDPOINT}`
        const API_KEY = process.env.MICROSOFT_FACIAL_API_KEY
        super(API_URL, API_KEY)
    }

}

module.exports = AzureEmotion