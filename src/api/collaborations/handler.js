const ClientError = require('../../exceptions/ClientError');

class CollaborationsHandler {
    constructor(collaborationService, notesService, validator) {
        this._collaborationService = collaborationService;
        this._notesService = notesService;
        this._validator = validator;

        this.postCollaborationHandler = this.postCollaborationHandler.bind(this);
        this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this);
    }

    async postCollaborationHandler(req, h) {
        try {
            this._validator.validateCollaborationPayload(req.payload);

            const { id: owner } = req.auth.credentials;
            const { noteId, userId } = req.payload;

            await this._notesService.verifyNoteOwner(noteId, owner);
            const collaborationId = await this._collaborationService.addCollaboration(noteId, userId);

            const response = h.response({
                status: 'success',
                message: 'Kolaborasi berhasil ditambahkan',
                data: {
                    collaborationId,
                },
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
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }

    async deleteCollaborationHandler(req, h) {
        try {
            this._validator.validateCollaborationPayload(req.payload);

            const { id: owner } = req.auth.credentials;
            const { noteId, userId } = req.payload;

            await this._notesService.verifyNoteOwner(noteId, owner);
            await this._collaborationService.deleteCollaboration(noteId, userId);

            return {
                status: 'success',
                message: 'Kolaborasi berhasil dihapus',
            };
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
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }
}

module.exports = CollaborationsHandler;
