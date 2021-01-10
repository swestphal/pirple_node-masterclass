/*
primary file for the API
*/

// dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

// the server should respond to all requests with a string
const server = http.createServer(function (req, res) {
    // get url and parse it
    const parsedUrl = url.parse(req.url, true);

    // get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

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
        var chosenHandler =
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
});

// start the server, and have it listen on port 3000
server.listen(3000, function () {
    console.log('The server is listening on port 3000 now');
});

// define handlers
const handlers = {};

// sample handler
handlers.sample = function (data, callback) {
    callback(406, { name: 'sampleHandler' });
};

handlers.notFound = function (data, callback) {
    // callback a http status code and payload object
    callback(404);
};

const router = {
    sample: handlers.sample,
};
