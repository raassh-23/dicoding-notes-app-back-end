const ClientError = require('../../exceptions/ClientError');

class ExportsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        this.postExportNotesHandler = this.postExportNotesHandler.bind(this);
    }

    async postExportNotesHandler(req, h) {
        try {
            this._validator.validateExportNotesPayload(req.payload);

            const message = {
                userId: req.auth.credentials.id,
                targetEmail: req.payload.targetEmail,
            };

            await this._service.sendMessage('export:notes', JSON.stringify(message));


            const response = h.response({
                status: 'success',
                message: 'Permintaan Anda dalam antrean',
            });

            response.code(201);
            return response;
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });

                response.code(error.statusCode);
                return response;
            }

            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami',
            });

            response.code(500);
            console.error(error);
            return response;
        }
    }
}

module.exports = ExportsHandler;
