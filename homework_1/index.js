/*
primary file for the API
*/

// dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

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

// all the server logic for http
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
    let buffer = '';
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
            console.log(buffer);
            res.end(payloadString);
        });
    });
};

// define handlers

const handlers = {};

// route handlers

// hello handlers

handlers.hello = function (data, callback) {
    callback(200, { message: 'Welcome to the first Node Homework' });
};

handlers.notFound = function (data, callback) {
    callback(404);
};

// routes

const router = {
    hello: handlers.hello,
};
