/*
create and add configuration variables
NODE_ENV=staging node index.js
*/
//openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem

// container for all the environments

// staging (default) environment

const environments = {
    production: {
        httpPort: 5000,
        httpsPort: 5001,
        envName: 'production',
    },
    staging: {
        httpPort: 3000,
        httpsPort: 3001,
        envName: 'staging',
    },
};

// determin which environment was passed in command-line

const currentEnvironment =
    typeof process.env.NODE_ENV == 'string'
        ? process.env.NODE_ENV.toLocaleLowerCase()
        : '';

// check that passed environment is one of the above
const environmentToExport =
    typeof environments[currentEnvironment] === 'object'
        ? environments[currentEnvironment]
        : environments.staging;
console.log(environmentToExport);
module.exports = environmentToExport;
