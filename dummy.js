const express = require('express')
const app = express()

const cors = require("cors");
app.use(cors({
	origin: "*"
}));

require('dotenv').config();

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
