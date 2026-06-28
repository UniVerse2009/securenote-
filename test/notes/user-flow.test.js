const request = require('supertest')
const { app } = require('../../server')

let token
let noteId

describe('Notes - User Flow (Status Code Only)', () => {

	// 1. Root check (biar tau server hidup)
	it('GET / should return 200', async () => {
		const res = await request(app).get('/')

		expect(res.statusCode).toBe(200)
	})

	// 2. Login dulu (biar gak pura-pura punya token)
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

		const json = await res.json()

		if (!json.access_token) {
			throw new Error('Failed to get access token from Keycloak')
		}

		token = json.access_token
	})

	// 3. Create Note
	it('POST /notes should return 201', async () => {
		const res = await request(app)
			.post('/notes')
			.set('Authorization', `Bearer ${token}`)
			.send({
				title: 'Test Title',
				content: 'Test Content'
			})

		expect(res.statusCode).toBe(201)

		// simpan id buat test berikutnya
		noteId = res.body.id
	})

	// 4. Get All Notes
	it('GET /notes should return 200', async () => {
		const res = await request(app)
			.get('/notes')
			.set('Authorization', `Bearer ${token}`)

		expect(res.statusCode).toBe(200)
	})

	// 5. Get Note by ID
	it('GET /notes/:id should return 200', async () => {
		const res = await request(app)
			.get(`/notes/${noteId}`)
			.set('Authorization', `Bearer ${token}`)

		expect(res.statusCode).toBe(200)
	})

	// 6. Update Note
	it('PATCH /notes/:id should return 200', async () => {
		const res = await request(app)
			.patch(`/notes/${noteId}`)
			.set('Authorization', `Bearer ${token}`)
			.send({
				title: 'Updated Title'
			})

		expect(res.statusCode).toBe(200)
	})

	// 7. Delete Note
	it('DELETE /notes/:id should return 200', async () => {
		const res = await request(app)
			.delete(`/notes/${noteId}`)
			.set('Authorization', `Bearer ${token}`)

		expect(res.statusCode).toBe(200)
	})
})
