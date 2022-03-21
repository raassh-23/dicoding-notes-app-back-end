require('dotenv').config();

const Hapi = require('@hapi/hapi');
const notes = require('./api/notes');
const NoteService = require('./services/postgres/notesService');
const NotesValidator = require('./validator/notes');

const users = require('./api/users');
const UsersService = require('./services/postgres/usersService');
const UsersValidator = require('./validator/users');

const init = async () => {
  const notesServices = new NoteService();
  const usersServices = new UsersService();

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
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
