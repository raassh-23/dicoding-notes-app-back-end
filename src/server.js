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

const Jwt = require('@hapi/jwt');

const init = async () => {
  const notesServices = new NoteService();
  const usersServices = new UsersService();
  const authenticationsServices = new AuthenticationService();

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
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
