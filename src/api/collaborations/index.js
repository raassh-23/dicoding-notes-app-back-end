const CollaborationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'collaborations',
    version: '1.0.0',
    register: async (server, { collaborationService, notesService, validator }) => {
        const handler = new CollaborationsHandler(collaborationService, notesService, validator);

        server.route(routes(handler));
    },
};
