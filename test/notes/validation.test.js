const request = require('supertest')
const { app } = require('../../server')

let token

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://localhost:8080'
const REALM = 'myrealm'

beforeAll(async () => {
	const data = new URLSearchParams()
	data.append('client_id', 'frontend')
	data.append('grant_type', 'password')
	data.append('username', 'dummy')
	data.append('password', 'dummy')

	const res = await fetch(
		`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: data
		}
	)

	if (!res.ok) {
		throw new Error(`Keycloak request failed: ${res.status}`)
	}

	const json = await res.json()

	if (!json.access_token) {
		console.error(json)
		throw new Error('Failed to get access token from Keycloak')
	}

	token = json.access_token
})

describe('Notes - Validation', () => {

	// ========================
	// CREATE NOTE VALIDATION
	// ========================
	describe('POST /notes', () => {

		it('should return 400 if title is missing', async () => {
			const res = await request(app)
				.post('/notes')
				.set('Authorization', `Bearer ${token}`)
				.send({
					content: 'Some content'
				})

			expect(res.statusCode).toBe(400)
		})

		it('should return 400 if content is missing', async () => {
			const res = await request(app)
				.post('/notes')
				.set('Authorization', `Bearer ${token}`)
				.send({
					title: 'Some title'
				})

			expect(res.statusCode).toBe(400)
		})

		it('should return 400 if title is not a string', async () => {
			const res = await request(app)
				.post('/notes')
				.set('Authorization', `Bearer ${token}`)
				.send({
					title: 123,
					content: 'Valid content'
				})

			expect(res.statusCode).toBe(400)
		})

		it('should return 400 if content is not a string', async () => {
			const res = await request(app)
				.post('/notes')
				.set('Authorization', `Bearer ${token}`)
				.send({
					title: 'Valid title',
					content: 123
				})

			expect(res.statusCode).toBe(400)
		})

		it('should return 400 if title is empty (whitespace)', async () => {
			const res = await request(app)
				.post('/notes')
				.set('Authorization', `Bearer ${token}`)
				.send({
					title: '   ',
					content: 'Valid content'
				})

			expect(res.statusCode).toBe(400)
		})

		it('should return 400 if content is empty (whitespace)', async () => {
			const res = await request(app)
				.post('/notes')
				.set('Authorization', `Bearer ${token}`)
				.send({
					title: 'Valid title',
					content: '   '
				})

			expect(res.statusCode).toBe(400)
		})

	})

	// ========================
	// UPDATE NOTE VALIDATION
	// ========================
	describe('PATCH /notes/:id', () => {

		let noteId

		beforeAll(async () => {
			const res = await request(app)
				.post('/notes')
				.set('Authorization', `Bearer ${token}`)
				.send({
					title: 'Initial Title',
					content: 'Initial Content'
				})

			noteId = res.body.id
		})

		it('should return 400 if body is empty', async () => {
			const res = await request(app)
				.patch(`/notes/${noteId}`)
				.set('Authorization', `Bearer ${token}`)
				.send({})

			expect(res.statusCode).toBe(400)
		})

		it('should return 400 if title is not string', async () => {
			const res = await request(app)
				.patch(`/notes/${noteId}`)
				.set('Authorization', `Bearer ${token}`)
				.send({
					title: 123
				})

			expect(res.statusCode).toBe(400)
		})

		it('should return 400 if content is not string', async () => {
			const res = await request(app)
				.patch(`/notes/${noteId}`)
				.set('Authorization', `Bearer ${token}`)
				.send({
					content: 123
				})

			expect(res.statusCode).toBe(400)
		})

	})

})
