const request = require('supertest')
const { app } = require('../../server')

let adminToken
let userToken

beforeAll(async () => {
	// ADMIN LOGIN
	const adminData = new URLSearchParams()
	adminData.append('client_id', 'frontend')
	adminData.append('grant_type', 'password')
	adminData.append('username', 'admin')
	adminData.append('password', 'admin')

	const adminRes = await fetch(
		'http://localhost:8080/realms/myrealm/protocol/openid-connect/token',
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: adminData
		}
	)

	const adminJson = await adminRes.json()
	adminToken = adminJson.access_token

	// USER LOGIN (non-admin)
	const userData = new URLSearchParams()
	userData.append('client_id', 'frontend')
	userData.append('grant_type', 'password')
	userData.append('username', 'dummy')
	userData.append('password', 'dummy')

	const userRes = await fetch(
		'http://localhost:8080/realms/myrealm/protocol/openid-connect/token',
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: userData
		}
	)

	const userJson = await userRes.json()
	userToken = userJson.access_token
})

describe('Admin Security', () => {

	it('should reject access without token', async () => {
		const res = await request(app).get('/admin/notes')
		expect(res.statusCode).toBe(401)
	})

	it('should reject invalid token', async () => {
		const res = await request(app)
			.get('/admin/notes')
			.set('Authorization', 'Bearer ngasal')

		expect(res.statusCode).toBe(401)
	})

	it('should reject non-admin user', async () => {
		const res = await request(app)
			.get('/admin/notes')
			.set('Authorization', `Bearer ${userToken}`)

		expect(res.statusCode).toBe(403)
	})
})
