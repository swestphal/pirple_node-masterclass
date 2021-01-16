/*
* server related tasks
*/
// dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');
const path = require('path');
const handlers = require('./handlers');
const helpers = require('./helpers');
const config = require('./config');


// @todo remove
/*
helpers.sendTwilioSms('15005550009', 'hello', function (err) {
    console.log("this is the error ", err)
})*/


// instantiage the server module object
var server = {};

// instantiate the http server
server.httpServer = http.createServer(function (req, res) {
    server.unifiedServer(req, res);
});


// instantiate the https server
server.httpsServerOptions = {
    key: fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '/../https/cert.pem')),
};
server.httpsServer = https.createServer(server.httpsServerOptions, function (req, res) {
    server.unifiedServer(req, res);
});



// all the server logic for http and https
server.unifiedServer = function (req, res) {
    // get url and parse it
    const parsedUrl = url.parse(req.url, true);

    // get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // get the http method
    const method = req.method.toLocaleLowerCase();

    // get the query string as an object
    const queryStringObject = parsedUrl.query;

    // get the headers
    const headers = req.headers;

    // get payloads, if any
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', function (data) {
        buffer += decoder.write(data);
    });
    req.on('end', function () {
        buffer += decoder.end();

        // choose the handler this request should go to
        const chosenHandler =
            typeof server.router[trimmedPath] !== 'undefined'
                ? server.router[trimmedPath]
                : handlers.notFound;

        // construct data object to send to handler

        const data = {
            trimmedPath: trimmedPath,
            queryStringObject: queryStringObject,
            method: method,
            headers: headers,
            payload: helpers.parseJsonToObject(buffer),
        };

        // route request  to handler specified in the router
        chosenHandler(data, function (statusCode, payload) {
            // use status code called back by the handler, or default 200
            statusCode = typeof statusCode === 'number' ? statusCode : 200;

            // use the payload called back by the handler, or default to an empty object
            payload = typeof payload === 'object' ? payload : {};

            // convert the payload to a string
            const payloadString = JSON.stringify(payload);

            // return response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
        });
    });
};

server.router = {
    ping: handlers.ping,
    users: handlers.users,
    tokens: handlers.tokens,
    checks: handlers.checks,
};


// init script
server.init = function () {
    // start the server, and have it listen on port 3000
    server.httpServer.listen(config.httpPort, function () {
        console.log(
            'The server is listening on port ' +
            config.httpPort +
            ' now in ' +
            config.envName +
            ' mode'
        );
    });

    server.httpsServer.listen(config.httpsPort, function () {
        console.log(
            'The server is listening on port ' +
            config.httpsPort +
            ' now in ' +
            config.envName +
            ' mode'
        );
    });

}



// export the module
module.exports = server;