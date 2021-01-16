/*
 * helpers for various tasks
 */

// dependencies
const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const queryString = require('querystring');

// container for helpers
const helpers = {};



// create a sha256 hash
helpers.hash = function (str) {
    if (typeof str === 'string' && str.length > 0) {
        var hash = crypto
            .createHmac('sha256', config.hashingSecret)
            .update(str)
            .digest('hex');
        return hash;
    } else {
        return false;
    }
};

helpers.parseJsonToObject = function (str) {
    try {
        const obj = JSON.parse(str);
        return obj;
    } catch (err) {
        return {};
    }
};

// create a string of random alphanumeric characters of a given length
helpers.createRandomString = function (strLength) {
    strLength =
        typeof strLength === 'number' && strLength > 0 ? strLength : false;
    if (strLength) {
        // define all possible characters
        var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

        var str = '';
        for (let i = 1; i <= strLength; i++) {
            // get character
            const randomCharacter = possibleCharacters.charAt(
                Math.floor(Math.random() * possibleCharacters.length)
            );
            // append to final string
            str += randomCharacter;
        }
        return str;
    } else {
        return false;
    }
};

helpers.sendTwilioSms = function (phone, msg, callback) {
    phone = typeof (phone) === 'string' && phone.trim().length > 5 ? phone.trim() : false;
    msg = typeof (msg) === 'string' && msg.trim().length <= 1600 ? msg.trim() : false;
    if (phone && msg) {
        // configure the request payload
        const payload = {
            'From': config.twilio.fromPhone,
            'To': '+1' + phone,
            'Body': msg
        }
        // stringify payload
        const stringPayload = queryString.stringify(payload);

        // configure the request details
        const requestDetails = {
            'protocol': 'https:',
            'hostname': 'api.twilio.com',
            'method': 'POST',
            'path': '/2010-04-01/Accounts/' + config.twilio.accountSid + '/Messages.json',
            'auth': config.twilio.accountSid + ':' + config.twilio.authToken,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload)
            }
        }
        // instantiate the request object
        var req = https.request(requestDetails, function (res) {
            // grab status of the sent request
            const status = res.statusCode
            // callback successfully if request went through
            if (status === 200 || status === 201) {
                callback(false)
            } else {
                callback('Status code returned was ' + status)
            }
        })

        // bind to the error event so it doesnt get thrown
        req.on('error', function (e) {
            callback(e)
        })
        // add the payload
        req.write(stringPayload);

        // end the request
        req.end();
    } else {
        callback('Given parameters were missing or invalid')
    }
}

// export the module
module.exports = helpers;
