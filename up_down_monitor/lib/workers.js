/*
* worker related tasks
*/

// dependencies
const path = require('path');
const fs = require('js');
const _data = require('./data');
const https = require('https');
const http = require('http');
const helpers = require('./helpers');
const url = require('url');

// instantiate workers object
const workers = {};

// lookup all checks, get their data and send to a validator
workers.gatherAllChecks = function () {
    // gett all checks
    _data.list('checks', function (err, checks) {
        if (!err && checks && checks.length > 0) {
            checks.forEach(function (check) {
                // read in the check data
                _data.read('checks', check, function (err, originalCheckData) {
                    if (!err && originalCheckData) {
                        // pass id to the validator and let continue or log error as needed
                        workers.validateCheckData(originalCheckData)
                    } else {
                        console.log("Error while reading on of the checks data")
                    }
                })
            })
        } else {
            console.log("Error. No checks to process")
        }
    })
}

// sanity checking the check data
workers.validateCheckData = function (originalCheckData) {
    const originalCheckData = typeof (originalCheckData) === 'object' && originalCheckData !== null ? originalCheckData : {}
    originalCheckData.id = typeof (originalCheckData.id) === 'string' && originalCheckData.id.trim().length >= 5 ? originalCheckData.id.trim() : false
    originalCheckData.phone = typeof (originalCheckData.phone) === 'string' && originalCheckData.phone.trim().length >= 5 ? originalCheckData.phone.trim() : false
    originalCheckData.protocol = typeof (originalCheckData.protocol) === 'string' && ['http', 'https'].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol.trim() : false
    originalCheckData.url = typeof (originalCheckData.url) === 'string' && originalCheckData.url.trim().length > 0 ? originalCheckData.url.trim() : false
    originalCheckData.method = typeof (originalCheckData.method) === 'string' && ['post', 'get', 'put', 'delete'].indexOf(originalCheckData.method) > -1 ? originalCheckData.method.trim() : false
    originalCheckData.successCodes = typeof (originalCheckData.successCodes) === 'object' && originalCheckData.successCodes instanceof Array && originalCheckData.successCodes.length > 0 ? originalCheckData.successCodes.trim() : false
    originalCheckData.timeoutSeconds = typeof (originalCheckData.timeoutSeconds) === 'number' && originalCheckData.timeoutSeconds % 1 === 0 && originalCheckData.timeoutSeconds > 0 ? originalCheckData.timeoutSeconds.trim() : false

    // set the keya that may not be set 
}



// timer to execute the worker-process once per minute
workers.loop = function () {
    setInterval(function () {
        workers.gatherAllChecks()
    }, 1000 * 60)
}

// init script
workers.init = function () {
    // execute all checks
    workers.gatherAllChecks();

    // call the loop so the checks will execute later on
    workers.loop();
}

// export the module
module.exports = workers