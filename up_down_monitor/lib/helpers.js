/*
 * helpers for various tasks
 */

// dependencies
const crypto = require('crypto');
const config = require('./config');

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

// export the module
module.exports = helpers;
