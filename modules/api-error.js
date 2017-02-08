'use strict';


/**
 * Load modules dependencies.
 */
// Built-in


// Npm
const SimpleError = require('simple-error');


// Mine
const jsonApiResponse = require("../static/api-response-status.json");




const getError = function (status,msg) {
    let _status = 404 , _msg = jsonApiResponse['404'];

    // Check for status provided ?
    if(status){
        _status = (status instanceof Error) ? 404 : status;
        if(arguments.length === 1) // Only called with status, no msg
            _msg = jsonApiResponse[_status+''];
    }

    // Check msg is :Error ?
    if(msg)
        _msg = (msg instanceof Error) ? msg.message : msg;

    this.statusCode = this.status = _status;
    this.message = _msg;
};




const ApiError = SimpleError.define('ApiError',{
    status: 404,
    message: 'Not Found',
    ctor : getError
});




/*********************************
 * All possbile Error coming from the API.
 *********************************/


/**
 * Error 204 - No Content
 */
ApiError.NoContent = SimpleError.define('ApiError',{ status: 204 });

/**
 * Error 400 - Bad Request
 */
ApiError.BadRequest = SimpleError.define('ApiError',{ status: 400 });

/**
 * Error 401 - Unauthorized
 */
ApiError.Unauthorized = SimpleError.define('ApiError',{ status: 401 });

/**
 * Error 403 - Forbidden
 */
ApiError.Forbidden = SimpleError.define('ApiError',{ status: 403 });

/**
 * Error 404 - Not Found
 */
ApiError.NotFound = SimpleError.define('ApiError',{ status: 404 });

/**
 * Error 405 - Method Not Allowed
 */
ApiError.MethodNotAllowed = SimpleError.define('ApiError',{ status: 405 });

/**
 * Error 409 - Conflict
 */
ApiError.Conflict = SimpleError.define('ApiError',{ status: 409 });

/**
 * Error 500 - Internal Server Error
 */
ApiError.InternalError = SimpleError.define('ApiError',{ status: 500 });





module.exports = ApiError;