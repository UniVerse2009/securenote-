const express = require('express')
const app = express()

require('dotenv').config();
const path = require('path')

const notesRoutes = require('./routes/notes.routes')
const adminRoutes = require('./routes/admin.routes')

/**
 * middleware: parse JSON
 */
app.use(express.json())

/**
 * health check (biar gak nebak server hidup apa mati)
 */
app.get('/', (req, res) => {
	res.status(200).json({ message: 'API is running' })
})

/**
 * routes
 */
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/notes', notesRoutes)
app.use('/admin', adminRoutes)

/**
 * 404 handler
 */
app.use((req, res, next) => {
	const err = new Error('Route not found')
	err.status = 404
	next(err)
})

/**
 * global error handler
 */
app.use((err, req, res, next) => {
	const status = err.status || 500

	res.status(status).json({
		error: {
			message: err.message || 'Internal Server Error'
		}
	})
})

/**
 * start server
 */
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})

module.exports = { app };
