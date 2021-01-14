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

// export the module
module.exports = helpers;
