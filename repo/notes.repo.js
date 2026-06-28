const { query } = require('../config/db')

/**
 * CREATE NOTE
 */
const create = async ({ uid, email, title, content }) => {
	const result = await query(
		`INSERT INTO notes (uid, email, title, content, created_at, updated_at)
		 VALUES (?, ?, ?, ?, NOW(), NOW())`,
		[uid, email, title, content]
	)

	return {
		id: result.insertId,
		uid,
		email,
		title,
		content
	}
}

/**
 * FIND BY USER ID
 */
const findByUserId = async (uid) => {
	const [rows] = await query(
		`SELECT uid, title FROM notes WHERE uid = ? ORDER BY created_at DESC`,
		[uid]
	)

	return rows
}

/**
 * FIND BY NOTE ID
 */
const findById = async (id) => {
	const [rows] = await query(
		`SELECT * FROM notes WHERE id = ? LIMIT 1`,
		[id]
	)


	return rows || null
}

/**
 * GET ALL NOTES (ADMIN)
 * - hanya ambil field yang diperlukan
 * - untuk mencegah over-fetching data
 */
const findAll = async () => {
	const rows = await query(
		`SELECT 
			id,
			uid,
			email,
			title,
			created_at,
			updated_at
		 FROM notes
		 ORDER BY created_at DESC`
	)

	return rows
}

/**
 * UPDATE NOTE
 */
const update = async (id, { title, content }) => {
	await query(
		`UPDATE notes
		 SET title = ?, content = ?, updated_at = NOW()
		 WHERE id = ?`,
		[title, content, id]
	)

	return findById(id)
}

/**
 * DELETE NOTE
 */
const deleteNote = async (id) => {
	await query(
		`DELETE FROM notes WHERE id = ?`,
		[id]
	)

	return true
}

module.exports = {
	create,
	findByUserId,
	findById,
	findAll,
	update,
	delete: deleteNote
}
