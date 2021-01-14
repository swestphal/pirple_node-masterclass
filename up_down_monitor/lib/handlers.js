/*
 request handlers
 */

const { data } = require('../lib/data');
const _data = require('../lib/data');
const helpers = require('../lib/helpers');

// define handlers
const handlers = {};

handlers.users = function (data, callback) {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
};

// container for the users submethods
handlers._users = {};

// users - post
// required data:   firstName, lastName, phone, password, tosAgreement
// optional data: none

handlers._users.post = function (data, callback) {
    // check that all required fields are filled out
    const firstName =
        typeof data.payload.firstName == 'string' &&
        data.payload.firstName.trim().length > 0
            ? data.payload.firstName.trim()
            : false;
    const lastName =
        typeof data.payload.lastName == 'string' &&
        data.payload.lastName.trim().length > 0
            ? data.payload.lastName.trim()
            : false;
    const phone =
        typeof data.payload.phone == 'string' &&
        data.payload.phone.trim().length > 5
            ? data.payload.phone.trim()
            : false;
    const password =
        typeof data.payload.password == 'string' &&
        data.payload.password.trim().length > 6
            ? data.payload.password.trim()
            : false;
    const tosAgreement =
        typeof data.payload.tosAgreement == 'boolean' &&
        data.payload.tosAgreement === true
            ? true
            : false;
    console.log(firstName, lastName, phone, password, tosAgreement);
    if (firstName && lastName && phone && password && tosAgreement) {
        // make sure that user already exist
        _data.read('users', phone, function (err, data) {
            if (err) {
                // hash the password
                var hashedPassword = helpers.hash(password);

                // create the user object
                if (hashedPassword) {
                    const userObject = {
                        firstName: firstName,
                        lastName: lastName,
                        phone: phone,
                        hashedPassword: hashedPassword,
                        tosAgreement: true,
                    };
                    _data.create('users', phone, userObject, function (err) {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, {
                                Error: 'Could not create the new user',
                            });
                        }
                    });
                } else {
                    callback(500, {
                        Error: "Could not has the user's password",
                    });
                }
            } else {
                callback(400, {
                    Error: 'A user with that phone number already exist',
                });
            }
        });
    } else {
        callback(400, { Error: 'Missing required fields' });
    }
};

// users - get
// required data: phone
// optional data: none
// @todo only let an authenticated user access their object
handlers._users.get = function (data, callback) {
    // check that phone number is provided
    const phone =
        typeof data.queryStringObject.phone == 'string' &&
        data.queryStringObject.phone.trim().length > 5
            ? data.queryStringObject.phone.trim()
            : false;

    console.log('xxxx', phone);
    if (phone) {
        _data.read('users', phone, function (err, data) {
            if (!err && data) {
                // remove hashed password from user object before returning to requester
                delete data.hashedPassword;
                callback(200, data);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, { Error: 'Missing required field' });
    }
};

// users - put
// required data : phone
// optional data : firstName, lastName, password (at least one)
// @todo let only authenticated user update their own object
handlers._users.put = function (data, callback) {
    // check for the required field
    console.log;
    const phone =
        typeof data.payload.phone == 'string' &&
        data.payload.phone.trim().length > 5
            ? data.payload.phone.trim()
            : false;

    // check optional fields
    const firstName =
        typeof data.payload.firstName == 'string' &&
        data.payload.firstName.trim().length > 0
            ? data.payload.firstName.trim()
            : false;
    const lastName =
        typeof data.payload.lastName == 'string' &&
        data.payload.lastName.trim().length > 0
            ? data.payload.lastName.trim()
            : false;
    const password =
        typeof data.payload.password == 'string' &&
        data.payload.password.trim().length > 6
            ? data.payload.password.trim()
            : false;

    console.log('->', phone);
    // error if phone is invalid
    if (phone) {
        if (firstName || lastName || password) {
            // lookup user
            _data.read('users', phone, function (err, userData) {
                if (!err && userData) {
                    // update the fields necessary
                    if (firstName) {
                        userData.firstName = firstName;
                    }
                    if (lastName) {
                        userData.lastName = lastName;
                    }
                    if (password) {
                        userData.hashedPassword = helpers.hash(password);
                    }
                    // store new updates
                    _data.update('users', phone, userData, function (err) {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, {
                                Error: 'Could not update the user',
                            });
                        }
                    });
                } else {
                    callback(400, {
                        Error: 'The specified user does not exist',
                    });
                }
            });
        } else {
            callback(400, { Error: 'Missing fields to update' });
        }
    } else {
        callback(400, { Error: 'Missing required field' });
    }
};

// users - delete
// required field : phone
// optional field :
// @todo only let authenticated user delete their account
// @todo cleanup any other data related to user
handlers._users.delete = function (data, callback) {
    // check if phone is valid
    const phone =
        typeof data.queryStringObject.phone == 'string' &&
        data.queryStringObject.phone.trim().length > 5
            ? data.queryStringObject.phone.trim()
            : false;

    if (phone) {
        _data.read('users', phone, function (err, data) {
            if (!err && data) {
                _data.delete('users', phone, function (err) {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, {
                            Error: "Couldn't delete specified user",
                        });
                    }
                });
            } else {
                callback(400, {
                    Error: "Couldn't not find the specified user",
                });
            }
        });
    } else {
        callback(400, { Error: 'Missing required field' });
    }
};

// ping handler
handlers.ping = function (data, callback) {
    callback(200);
};

// not found handler
handlers.notFound = function (data, callback) {
    callback(404);
};

// export module
module.exports = handlers;
