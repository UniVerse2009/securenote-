const notesRepo = require('../repo/notes.repo')
const createError = (status, message) => {
	const err = new Error(message)
	err.status = status
	return err
}

/**
 * CREATE NOTE
 */
const createNote = async (uid, email, title, content) => {
	const note = await notesRepo.create({
		uid,
		email,
		title,
		content
	})

	return note
}

/**
 * GET ALL NOTES (by user)
 */
const getNotesByUser = async (uid) => {
	return await notesRepo.findByUserId(uid)
}

/**
 * GET SINGLE NOTE (SAFE)
 * - pastikan note milik user
 */
const getNoteById = async (uid, noteId) => {
	const note = await notesRepo.findById(noteId)

	if (!note) {
		throw createError(404, 'Note not found')
	}

	if (note.uid !== uid) {
		throw createError(403, 'Forbidden')
	}

	return note
}

const getNoteByIdAsAdmin = async (noteId) => {
	const note = await notesRepo.findById(noteId)

	if (!note) {
		console.log("Tidak dapat menemukan note id: " + noteId);
		console.log(note);
		throw createError(404, 'Note not found')
	}

	console.log("SERVICE BREAKPOINT");

	return note
}



const getAllNotes = async () => {
	return await notesRepo.findAll()
}

/**
 * UPDATE NOTE (SAFE)
 */
const updateNote = async (uid, noteId, title, content) => {
	const note = await notesRepo.findById(noteId)

	if (!note) {
		throw createError(404, 'Note not found')
	}

	if (note.uid !== uid) {
		throw createError(403, 'Forbidden')
	}

	const updated = await notesRepo.update(noteId, {
		title: title ?? note.title,
		content: content ?? note.content
	})

	return updated
}

/**
 * DELETE NOTE (SAFE)
 */
const deleteNote = async (uid, noteId) => {
	const note = await notesRepo.findById(noteId)

	if (!note) {
		throw createError(404, 'Note not found')
	}

	if (note.uid !== uid) {
		throw createError(403, 'Forbidden')
	}

	await notesRepo.delete(noteId)

	return true
}

module.exports = {
	createNote,
	getNotesByUser,
	getNoteById,
	getNoteByIdAsAdmin,
	getAllNotes,
	updateNote,
	deleteNote
}
