const request = require('supertest')
const { app } = require('../../server')

let userAToken
let userBToken
let noteId

describe('Notes - Security (Keycloak)', () => {

	beforeAll(async () => {
		// =========================
		// 🔐 LOGIN USER A
		// =========================
		const dataA = new URLSearchParams()
		dataA.append('client_id', 'frontend')
		dataA.append('grant_type', 'password')
		dataA.append('username', 'dummy')
		dataA.append('password', 'dummy')

		const resA = await fetch(
			'http://localhost:8080/realms/myrealm/protocol/openid-connect/token',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: dataA
			}
		)

		const jsonA = await resA.json()

		if (!jsonA.access_token) {
			throw new Error('Failed to get access token for User A')
		}

		userAToken = jsonA.access_token

		// =========================
		// 🔐 LOGIN USER B
		// =========================
		const dataB = new URLSearchParams()
		dataB.append('client_id', 'frontend')
		dataB.append('grant_type', 'password')
		dataB.append('username', 'stub')
		dataB.append('password', 'stub')

		const resB = await fetch(
			'http://localhost:8080/realms/myrealm/protocol/openid-connect/token',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: dataB
			}
		)

		const jsonB = await resB.json()

		if (!jsonB.access_token) {
			throw new Error('Failed to get access token for User B')
		}

		userBToken = jsonB.access_token

		// =========================
		// 📝 USER A CREATE NOTE
		// =========================
		const note = await request(app)
			.post('/notes')
			.set('Authorization', `Bearer ${userAToken}`)
			.send({
				title: 'Secret Note',
				content: 'Top Secret Content'
			})

		if (!note.body.id) {
			throw new Error('Failed to create note for setup')
		}

		noteId = note.body.id
	})

	// ========================
	// 🔐 AUTH TEST (401)
	// ========================

	it('GET /notes without token → 401', async () => {
		const res = await request(app).get('/notes')

		expect(res.statusCode).toBe(401)
	})

	it('POST /notes with invalid token → 401', async () => {
		const res = await request(app)
			.post('/notes')
			.set('Authorization', 'Bearer ngawur')
			.send({
				title: 'X',
				content: 'Y'
			})

		expect(res.statusCode).toBe(401)
	})

	it('GET /notes with wrong Authorization format → 401', async () => {
		const res = await request(app)
			.get('/notes')
			.set('Authorization', userAToken) // tanpa Bearer

		expect(res.statusCode).toBe(401)
	})

	// ========================
	// 🚫 OWNERSHIP TEST (403)
	// ========================

	it('GET /notes/:id milik user lain → 403', async () => {
		const res = await request(app)
			.get(`/notes/${noteId}`)
			.set('Authorization', `Bearer ${userBToken}`)

		expect(res.statusCode).toBe(403)
	})

	it('PATCH /notes/:id milik user lain → 403', async () => {
		const res = await request(app)
			.patch(`/notes/${noteId}`)
			.set('Authorization', `Bearer ${userBToken}`)
			.send({
				title: 'Hacked Title'
			})

		expect(res.statusCode).toBe(403)
	})

	it('DELETE /notes/:id milik user lain → 403', async () => {
		const res = await request(app)
			.delete(`/notes/${noteId}`)
			.set('Authorization', `Bearer ${userBToken}`)

		expect(res.statusCode).toBe(403)
	})
})
