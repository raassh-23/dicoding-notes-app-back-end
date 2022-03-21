const ClientError = require('./ClientError');

class AuhorizationError extends ClientError {
    constructor(message) {
        super(message, 403);
        this.name = 'AuhorizationError';
    }
}

module.exports = AuhorizationError;
