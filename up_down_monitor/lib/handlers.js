/*
 request handlers
 */

const data = require('../lib/data');
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
    const password =
        typeof data.payload.password == 'string' &&
        data.payload.password.trim().length > 3
            ? data.payload.password.trim()
            : false;
    const phone =
        typeof data.payload.phone == 'string' &&
        data.payload.phone.trim().length > 3
            ? data.payload.phone.trim()
            : false;
    const tosAgreement =
        typeof data.payload.tosAgreement == 'boolean' &&
        data.payload.tosAgreement === true
            ? true
            : false;

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

handlers._users.get = function (data, callback) {
    // check that phone number is provided
    const phone =
        typeof data.queryStringObject.phone == 'string' &&
        data.queryStringObject.phone.trim().length > 5
            ? data.queryStringObject.phone.trim()
            : false;

    if (phone) {
        // get the token from the headers
        const token =
            typeof data.headers.token === 'string' ? data.headers.token : false;
        // verify that given token is valid for phone number of user
        handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
            if (tokenIsValid) {
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
                callback(403, {
                    Error:
                        'Missing required token in header, or token is invalid',
                });
            }
        });
    } else {
        callback(400, { Error: 'Missing required field' });
    }
};

// users - put
// required data : phone
// optional data : firstName, lastName, password (at least one)

handlers._users.put = function (data, callback) {
    // check for the required field

    const phone =
        typeof data.payload.phone == 'string' &&
        data.payload.phone.trim().length > 3
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
        data.payload.password.trim().length > 3
            ? data.payload.password.trim()
            : false;

    // error if phone is invalid
    if (phone) {
        if (firstName || lastName || password) {
            // lookup user

            // get the token from the headers
            const token =
                typeof data.headers.token === 'string'
                    ? data.headers.token
                    : false;
            // verify that given token is valid for phone number of user
            handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
                if (tokenIsValid) {
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
                                userData.hashedPassword = helpers.hash(
                                    password
                                );
                            }
                            // store new updates
                            _data.update(
                                'users',
                                phone,
                                userData,
                                function (err) {
                                    if (!err) {
                                        callback(200);
                                    } else {
                                        callback(500, {
                                            Error: 'Could not update the user',
                                        });
                                    }
                                }
                            );
                        } else {
                            callback(400, {
                                Error: 'The specified user does not exist',
                            });
                        }
                    });
                } else {
                    callback(403, {
                        Error:
                            'Missing required token in header, or token is invalid',
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

// @todo cleanup any other data related to user
handlers._users.delete = function (data, callback) {
    // check if phone is valid
    const phone =
        typeof data.queryStringObject.phone == 'string' &&
        data.queryStringObject.phone.trim().length > 5
            ? data.queryStringObject.phone.trim()
            : false;

    if (phone) {
        // get the token from the headers
        const token =
            typeof data.headers.token === 'string' ? data.headers.token : false;
        // verify that given token is valid for phone number of user
        handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
            if (tokenIsValid) {
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
                callback(403, {
                    Error:
                        'Missing required token in header, or token is invalid',
                });
            }
        });
    } else {
        callback(400, { Error: 'Missing required field' });
    }
};

// tokens
handlers.tokens = function (data, callback) {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
};

// container for all the tokens methods
handlers._tokens = {};

// tokens - post
// required field :
// optional field :
handlers._tokens.post = function (data, callback) {
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
    if (phone && password) {
        // lookup the user who matches the phone number
        _data.read('users', phone, function (err, userData) {
            if (!err && userData) {
                // Hash the sent password and compare it to the password stored in user object
                const hashedPassword = helpers.hash(password);
                if (hashedPassword === userData.hashedPassword) {
                    // if valid create new token with random name, set expiration date 1 hour in the future
                    const tokenId = helpers.createRandomString(20);
                    const expires = Date.now() + 1000 * 60 * 60;
                    var tokenObject = {
                        phone: phone,
                        id: tokenId,
                        expires: expires,
                    };
                    //store the token
                    _data.create(
                        'tokens',
                        tokenId,
                        tokenObject,
                        function (err) {
                            if (!err) {
                                callback(200, tokenObject);
                            } else {
                                callback(500, {
                                    Error: 'Could not create the new token',
                                });
                            }
                        }
                    );
                } else {
                    callback(400, {
                        Error: 'Password did not match the specified user',
                    });
                }
            } else {
                callback(400, { Error: 'Could not find the specified user' });
            }
        });
    } else {
        callback(400, { Error: 'Missing required fields' });
    }
};

// tokens - get
// required field : id
// optional field : none
handlers._tokens.get = function (data, callback) {
    // check that id is valid
    const id =
        typeof data.queryStringObject.id == 'string' &&
        data.queryStringObject.id.trim().length > 17
            ? data.queryStringObject.id.trim()
            : false;
    if (id) {
        _data.read('tokens', id, function (err, tokenData) {
            if (!err && tokenData) {
                // remove hashed password from user object before returning to requester
                callback(200, tokenData);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, { Error: 'Missing required field' });
    }
};

// tokens - put
// required field : id, extend
// optional field : none
handlers._tokens.put = function (data, callback) {
    const id =
        typeof data.payload.id == 'string' && data.payload.id.trim().length > 17
            ? data.payload.id.trim()
            : false;
    const extend =
        typeof data.payload.extend == 'boolean' && data.payload.extend === true
            ? true
            : false;

    if (id && extend) {
        _data.read('tokens', id, function (err, tokenData) {
            if (!err && tokenData) {
                // check to make sure the token isnt already expired
                if (tokenData.expires > Date.now()) {
                    tokenData.expires = Date.now() * 1000 * 60 * 60;
                    // store new update
                    _data.update('tokens', id, tokenData, function (err) {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, {
                                Error:
                                    "Could not update the token's expiration",
                            });
                        }
                    });
                } else {
                    callback(400, {
                        Error:
                            'Token has already expired and cannot be extended',
                    });
                }
            } else {
                callback(400, { Error: 'Specified token does not exist' });
            }
        });
    } else {
        callback(400, { Error: 'Missing required fields or field is invalid' });
    }
};

// tokens - delete
// required field : id
// optional field : none
handlers._tokens.delete = function (data, callback) {
    // check if id is valid
    const id =
        typeof data.queryStringObject.id == 'string' &&
        data.queryStringObject.id.trim().length > 17
            ? data.queryStringObject.id.trim()
            : false;

    if (id) {
        // lookup token
        _data.read('tokens', id, function (err, data) {
            if (!err && data) {
                _data.delete('tokens', id, function (err) {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, {
                            Error: "Couldn't delete specified token",
                        });
                    }
                });
            } else {
                callback(400, {
                    Error: "Couldn't not find the specified token",
                });
            }
        });
    } else {
        callback(400, { Error: 'Missing required field' });
    }
};

// verify if a given id is currently valid for a given user
handlers._tokens.verifyToken = function (id, phone, callback) {
    // lookup the token
    _data.read('tokens', id, function (err, tokenData) {
        if (!err && tokenData) {
            // chack that the token is for the given user and has not expired
            if (tokenData.phone === phone && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
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
