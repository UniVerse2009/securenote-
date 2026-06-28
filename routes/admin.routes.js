const express = require('express')
const router = express.Router()

const requireAuth = require('../middlewares/auth')
const notesService = require('../services/notes.service')

const createError = (status, message) => {
	const err = new Error(message)
	err.status = status
	return err
}

/**
 * GET all notes (admin only)
 */
router.get('/notes', requireAuth('admin'), async (req, res, next) => {
	try {
		const notes = await notesService.getAllNotes()

		res.json(notes)
	} catch (err) {
		next(err)
	}
})

/**
 * GET single note (admin only, no ownership restriction)
 */
router.get('/notes/:id', requireAuth('admin'), async (req, res, next) => {
	try {
		const noteId = req.params.id

		const note = await notesService.getNoteByIdAsAdmin(noteId)

		if (!note) {
			return next(createError(404, 'Note not found'))
		}

		res.json(note)
	} catch (err) {
		next(err)
	}
})

module.exports = router
