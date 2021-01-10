/*
create and add configuration variables
NODE_ENV=staging node index.js
*/

// container for all the environments

// staging (default) environment

const environments = {
    production: {
        port: 5000,
        envName: 'production',
    },
    staging: {
        port: 3000,
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
