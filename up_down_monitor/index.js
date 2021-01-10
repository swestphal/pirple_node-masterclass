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

    console.log(parsedUrl);
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

        // send the response
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
        console.log('payload ', buffer);
    });
});

// start the server, and have it listen on port 3000
server.listen(3000, function () {
    console.log('The server is listening on port 3000 now');
});
