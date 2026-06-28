const request = require('supertest')
const { app } = require('../../server')

let token

beforeAll(async () => {
	const data = new URLSearchParams()
	data.append('client_id', 'frontend')
	data.append('grant_type', 'password')
	data.append('username', 'admin')
	data.append('password', 'admin')

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

	const json = await res.json()

	if (!json.access_token) {
		throw new Error('Failed to get access token from Keycloak')
	}

	token = json.access_token
})

describe('Admin Resource', () => {

	it('GET /admin/notes/:id should return 404 if not found', async () => {
		const res = await request(app)
			.get('/admin/notes/999999') // asumsi ID ini gak ada
			.set('Authorization', `Bearer ${token}`)

		expect(res.statusCode).toBe(404)
	})
})
