class ExpressError extends Error { // Extends base class "Error"
    constructor(message, statusCode) {
        super(); // Calls Error's (base class) constructor
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;