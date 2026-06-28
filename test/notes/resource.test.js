const request = require('supertest')
const { app } = require('../../server')

let token

describe('Notes - Resource (Not Found Cases)', () => {

	beforeAll(async () => {
		const data = new URLSearchParams()
		data.append('client_id', 'frontend')
		data.append('grant_type', 'password')
		data.append('username', 'dummy')
		data.append('password', 'dummy')

		const res = await fetch(
			'http://localhost:8080/realms/myrealm/protocol/openid-connect/token',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: data
			}
		)

		if (!res.ok) {
			throw new Error(`Keycloak error: ${res.status}`)
		}

		const json = await res.json()

		if (!json.access_token) {
			throw new Error('Failed to get access token from Keycloak')
		}

		token = json.access_token
	})

	// pakai ID yang sangat kecil kemungkinan ada
	const nonExistentId = 999999999

	it('GET /notes/:id → 404 if note not found', async () => {
		const res = await request(app)
			.get(`/notes/${nonExistentId}`)
			.set('Authorization', `Bearer ${token}`)

		expect(res.statusCode).toBe(404)
	})

	it('PATCH /notes/:id → 404 if note not found', async () => {
		const res = await request(app)
			.patch(`/notes/${nonExistentId}`)
			.set('Authorization', `Bearer ${token}`)
			.send({
				title: 'Does not matter'
			})

		expect(res.statusCode).toBe(404)
	})

	it('DELETE /notes/:id → 404 if note not found', async () => {
		const res = await request(app)
			.delete(`/notes/${nonExistentId}`)
			.set('Authorization', `Bearer ${token}`)

		expect(res.statusCode).toBe(404)
	})
})
