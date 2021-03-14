const admin = require('firebase-admin');
const serviceAccount = require("../adminSDK/clockerin-781f4-firebase-adminsdk-houpv-d2dd1b2920.json");

class Firebase {
    constructor() {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://clockerin-781f4.firebaseio.com"
        });
    }

    sendPushById(config) {
        /*  
        config = {
                reason: String, - Why is a message being sent e.g. shiftStart
                data: {
                    ... - Data sent to phone
                }
                token: String
            }
        */

        var message = {
            data: config.data,
            token: config.token
        }

        admin.messaging().send(message).then((response) => {
            console.log('Successfully sent message:', response);
        }).catch((error) => {
            console.log('Error sending message:', error);
        })

    }

    updateTokenById(id, token) {

    }

    getTokenById(id) {
        
        return "token";
    }
}

module.exports = Firebase;