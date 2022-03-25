require('dotenv').config();

const Hapi = require('@hapi/hapi');
const notes = require('./api/notes');
const NoteService = require('./services/postgres/notesService');
const NotesValidator = require('./validator/notes');

const users = require('./api/users');
const UsersService = require('./services/postgres/usersService');
const UsersValidator = require('./validator/users');

const authentications = require('./api/authentications');
const AuthenticationService = require('./services/postgres/authenticationService');
const AuthenticationValidator = require('./validator/authentications');
const tokenManager = require('./tokenize/TokenManager');

const collaborations = require('./api/collaborations');
const CollaborationService = require('./services/postgres/collaborationsService');
const CollaborationValidator = require('./validator/collaborations');

const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/producerService');
const ExportsValidator = require('./validator/exports');

const uploads = require('./api/uploads');
const StorageService = require('./services/storage/storageService');
const UploadsValidator = require('./validator/uploads');

const path = require('path');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');

const init = async () => {
  const collaborationService = new CollaborationService();
  const usersServices = new UsersService();
  const authenticationsServices = new AuthenticationService();
  const notesServices = new NoteService(collaborationService);
  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  server.auth.strategy('notesapp_jwt', 'jwt', {
    keys: [process.env.ACCESS_TOKEN_KEY],
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: notes,
      options: {
        service: notesServices,
        validator: NotesValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersServices,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationService: authenticationsServices,
        usersService: usersServices,
        tokenManager: tokenManager,
        validator: AuthenticationValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationService: collaborationService,
        notesService: notesServices,
        validator: CollaborationValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        service: storageService,
        validator: UploadsValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
