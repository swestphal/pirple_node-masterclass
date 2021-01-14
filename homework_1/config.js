/*
create and add configuration variables
*/

// NODE_ENV=staging node index.js
// openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem

// container for all the environments
// staging (default) and production environment

const environments = {
    production: {
        httpPort: 6000,
        envName: 'production',
    },
    staging: {
        httpPort: 4000,
        envName: 'staging',
    },
};

// determin which environment was passed in command-line

const currentEnvironment =
    typeof process.env.NODE_ENV == 'string'
        ? process.env.NODE_ENV.toLocaleLowerCase()
        : '';

// check that passed environment is one of the above
// fallback to staging

const environmentToExport =
    typeof environments[currentEnvironment] === 'object'
        ? environments[currentEnvironment]
        : environments.staging;

module.exports = environmentToExport;
