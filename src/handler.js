const { nanoid } = require('nanoid');
const notes = require('./notes');

const addNoteHandler = (request, h) => {
    const { title, tags, body } = request.payload;

    const id = nanoid(10);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const newNote = {
        id, title, createdAt, updatedAt, tags, body,
    };

    notes.push(newNote);

    const isSuccess = notes.filter((note) => note.id === id).length > 0;

    if (isSuccess) {
        return h.response({
            status: 'success',
            message: 'Catatan berhasil ditambahkan',
            data: {
                noteId: id,
            },
        })
            .code(201);
    } else {
        return h.response({
            status: 'fail',
            message: 'Catatan gagal ditambahkan',
        })
            .code(500);
    }
};

const getAllNotesHandler = () => ({
    status: 'success',
    data: {
        notes,
    },
});

const getNoteByIdHandler = (request, h) => {
    const { id } = request.params;

    const note = notes.filter((n) => n.id === id)[0];

    if (note) {
        return {
            status: 'success',
            data: {
                note,
            },
        };
    } else {
        return h.response({
            status: 'fail',
            message: 'Catatan tidak ditemukan',
        })
        .code(404);
    }
};

const editNoteByIdHandler = (request, h) => {
    const { id } = request.params;
    const { title, tags, body } = request.payload;

    const updatedAt = new Date().toISOString();

    const index = notes.findIndex((note) => note.id === id);

    if (index !== -1) {
        notes[index] = {
            ...notes[index],
            title,
            tags,
            body,
            updatedAt,
        };

        return h.response({
            status: 'success',
            message: 'Catatan berhasil diperbarui',
        })
        .code(200);
    } else {
        return h.response({
            status: 'fail',
            message: 'Catatan tidak ditemukan',
        })
        .code(404);
    }
};

const deleteNoteByIdHandler = (request, h) => {
    const { id } = request.params;

    const index = notes.findIndex((note) => note.id === id);

    if (index !== -1) {
        notes.splice(index, 1);

        return h.response({
            status: 'success',
            message: 'Catatan berhasil diperbarui',
        })
        .code(200);
    } else {
        return h.response({
            status: 'fail',
            message: 'Catatan tidak ditemukan',
        })
        .code(404);
    }
};

module.exports = { addNoteHandler, getAllNotesHandler, getNoteByIdHandler, editNoteByIdHandler, deleteNoteByIdHandler };
