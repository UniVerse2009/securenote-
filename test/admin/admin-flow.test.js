const request = require('supertest')
const { app } = require('../../server')

let token
let noteId

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

	/*const base64Url = token.split('.')[1];
	const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

	// Mengubah isi ke dalam bentuk teks JSON
	const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
		return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
	}).join(''));

	console.log(JSON.parse(jsonPayload));*/
})

describe('Admin Flow (Read Only)', () => {

	it('GET /admin/notes should return 200', async () => {
		const res = await request(app)
			.get('/admin/notes')
			.set('Authorization', `Bearer ${token}`)

		expect(res.statusCode).toBe(200)
	})

	it('GET /admin/notes/:id should return 200 (if exists)', async () => {
		// Ambil satu note dulu (kalau ada)
		const list = await request(app)
			.get('/admin/notes')
			.set('Authorization', `Bearer ${token}`)

		if (list.body.length === 0) return

		// console.log("ID untuk di cek: " + list.body[5].id);

		noteId = list.body[5].id

		const res = await request(app)
			.get(`/admin/notes/${noteId}`)
			.set('Authorization', `Bearer ${token}`)

		expect(res.statusCode).toBe(200)
	})
})
