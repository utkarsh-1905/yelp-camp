//Defining custom error class

//this is how its done.

class ExpressError extends Error{
    constructor(message,statusCode){
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;