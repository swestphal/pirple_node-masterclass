/*
primary file for the API
*/

// dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');

const config = require('./config');

// instantiate the http server
const httpServer = http.createServer(function (req, res) {
    unifiedServer(req, res);
});

// start the server, and have it listen on port 3000
httpServer.listen(config.httpPort, function () {
    console.log(
        'The server is listening on port ' +
            config.httpPort +
            ' now in ' +
            config.envName +
            ' mode'
    );
});

const httpsServerOptions = {
    key: fs.readFileSync('./https/key.pem'),
    cert: fs.readFileSync('./https/cert.pem'),
};

const httpsServer = https.createServer(httpsServerOptions, function (req, res) {
    unifiedServer(req, res);
});

httpsServer.listen(config.httpsPort, function () {
    console.log(
        'The server is listening on port ' +
            config.httpsPort +
            ' now in ' +
            config.envName +
            ' mode'
    );
});

// all the server logic for http and https
const unifiedServer = function (req, res) {
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
    let buffer = 'a';
    req.on('data', function (data) {
        buffer += decoder.write(data);
    });
    req.on('end', function () {
        buffer += decoder.end();

        // choose the handler this request should go to
        const chosenHandler =
            typeof router[trimmedPath] !== 'undefined'
                ? router[trimmedPath]
                : handlers.notFound;

        // construct data object to send to handler

        const data = {
            trimmedPath: trimmedPath,
            queryStringObject: queryStringObject,
            method: method,
            headers: headers,
            payload: buffer,
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
            console.log(buffer);
            console.log('Returning this response ', statusCode, payloadString);
        });

        /*// send the response
        res.end('hello world\n');
        // log the request
        console.log(
            'Request received on path: ' +
                trimmedPath +
                ' with ' +
                method +
                ' and with these query string parameters: ',
            queryStringObject
        );
        console.log('headers: ', headers);
        console.log('payload ', buffer);*/
    });
};

// define handlers
const handlers = {};

// sample handler
handlers.sample = function (data, callback) {
    callback(406, { name: 'sampleHandler' });
};

handlers.ping = function (data, callback) {
    callback(200);
};

handlers.notFound = function (data, callback) {
    // callback a http status code and payload object
    callback(404);
};

const router = {
    sample: handlers.sample,
    ping: handlers.ping,
};
