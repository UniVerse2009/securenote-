const express = require('express')
const router = express.Router()

const requireAuth = require('../middlewares/auth')
const notesService = require('../services/notes.service')

/**
 * helper error
 */
const createError = (status, message) => {
	const err = new Error(message)
	err.status = status
	return err
}

/**
 * CREATE note
 */
router.post('/', requireAuth(), async (req, res, next) => {
	try {
		const uid = req.user.sub
		const email = req.user.email
		const { title, content } = req.body

		// VALIDATION
		if (!title || !content) {
			return next(createError(400, 'title and content are required'))
		}

		if (typeof title !== 'string' || typeof content !== 'string') {
			return next(createError(400, 'title and content must be strings'))
		}

		if (title.trim().length === 0 || content.trim().length === 0) {
			return next(createError(400, 'title and content cannot be empty'))
		}

		const note = await notesService.createNote(uid, email, title, content)

		res.status(201).json(note)
	} catch (err) {
		next(err)
	}
})

/**
 * GET all notes (by user)
 */
router.get('/', requireAuth(), async (req, res, next) => {
	try {
		const uid = req.user.sub

		const notes = await notesService.getNotesByUser(uid)

		res.json(notes)
	} catch (err) {
		next(err)
	}
})

/**
 * GET single note
 */
router.get('/:id', requireAuth(), async (req, res, next) => {
	try {
		const uid = req.user.sub
		const noteId = req.params.id

		const note = await notesService.getNoteById(uid, noteId)

		res.json(note)
	} catch (err) {
		next(err)
	}
})

/**
 * UPDATE note
 */
router.patch('/:id', requireAuth(), async (req, res, next) => {
	try {
		const uid = req.user.sub
		const noteId = req.params.id
		const { title, content } = req.body

		// VALIDATION: harus ada minimal 1 field
		if (!title && !content) {
			return next(
				createError(400, 'at least title or content must be provided')
			)
		}

		if (title && typeof title !== 'string') {
			return next(createError(400, 'title must be a string'))
		}

		if (content && typeof content !== 'string') {
			return next(createError(400, 'content must be a string'))
		}

		const updated = await notesService.updateNote(
			uid,
			noteId,
			title,
			content
		)

		res.json(updated)
	} catch (err) {
		next(err)
	}
})

/**
 * DELETE note
 */
router.delete('/:id', requireAuth(), async (req, res, next) => {
	try {
		const uid = req.user.sub
		const noteId = req.params.id

		await notesService.deleteNote(uid, noteId)

		res.json({ message: 'Deleted' })
	} catch (err) {
		next(err)
	}
})

module.exports = router
