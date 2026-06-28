# SecureNote Backend

Backend REST API untuk **SecureNote**, aplikasi pencatatan (note-taking) sederhana yang menggunakan **Keycloak** sebagai Identity and Access Management (IAM).

Backend ini hanya bertanggung jawab untuk:

- Menyediakan REST API
- Memvalidasi Access Token dari Keycloak
- Menerapkan Role-Based Access Control (RBAC)
- Menyimpan data note ke database MySQL

Autentikasi dan manajemen pengguna **tidak** dilakukan oleh backend, melainkan sepenuhnya dikelola oleh Keycloak.

---

## Features

- JWT Authentication menggunakan Keycloak
- Validasi token menggunakan JWKS
- Role-Based Access Control (RBAC)
- CRUD Notes
- Admin endpoint
- MySQL Database
- Integration Test

---

## Project Structure

```
.
├── config/
│   └── db.js
│
├── keycloak/
│   └── myrealm-realm.json
│
├── middlewares/
│   └── auth.js
│
├── public/
│   ├── index.html
│   ├── loginwithgoogle.html
│   └── js/
│       └── keycloak.js
│
├── repo/
│   └── notes.repo.js
│
├── routes/
│   ├── admin.routes.js
│   └── notes.routes.js
│
├── services/
│   └── notes.service.js
│
├── test/
│
├── server.js
└── package.json
```

---

## Architecture

```
Client
    │
    │ Access Token
    ▼
Backend API
    │
    ├── Verify JWT
    ├── Validate Audience
    ├── Validate Authorized Party
    ├── Validate Roles
    ▼
Business Logic
    ▼
MySQL
```

**Identity Provider:** Keycloak

---

## Authentication

Backend menerima Bearer Access Token yang diterbitkan oleh Keycloak.

Setiap request ke endpoint yang dilindungi akan melakukan:

- Signature Verification
- Audience Validation
- Authorized Party Validation
- Role Validation (jika diperlukan)

Backend tidak membuat JWT sendiri.

---

## Authorization

Role diterapkan menggunakan middleware.

| Endpoint    | Role               |
|-------------|---------------------|
| `/notes/*`  | Authenticated User  |
| `/admin/*`  | Admin                |

---

## API

### Public

#### `GET /`

Health Check.

**Response**

```json
{
  "message": "API is running"
}
```

---

### Notes

> Seluruh endpoint membutuhkan Bearer Access Token.

#### `POST /notes`

Membuat note baru.

```json
{
  "title": "My Note",
  "content": "Hello"
}
```

#### `GET /notes`

Mengambil seluruh note milik user.

#### `GET /notes/:id`

Mengambil satu note milik user.

#### `PATCH /notes/:id`

Mengubah note.

#### `DELETE /notes/:id`

Menghapus note.

---

### Admin

> Membutuhkan role `admin`.

#### `GET /admin/notes`

Mengambil seluruh note.

#### `GET /admin/notes/:id`

Mengambil note berdasarkan ID.

---

## Prerequisites

Sebelum menjalankan backend, pastikan:

- Node.js telah terpasang
- MySQL telah berjalan
- Keycloak telah berjalan
- Realm telah di-import
- Direct Access Grant diaktifkan pada client yang digunakan untuk pengujian

Konfigurasi lengkap Keycloak dijelaskan pada dokumentasi Keycloak.

---

## Environment Variables

Buat file `.env`:

```env
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASS=password
DB_NAME=securenote
```

---

## Installation

Clone repository:

```bash
git clone <repository-url>
cd securenote
```

Install dependency:

```bash
npm install
```

Jalankan server:

```bash
npm start
```

atau

```bash
node server.js
```

---

## Obtaining an Access Token

Project ini tidak menyertakan frontend.

Untuk keperluan pengujian API, Access Token dapat diperoleh menggunakan **Direct Access Grant** pada Keycloak.

Contoh:

```bash
curl -X POST \
  http://localhost:8080/realms/myrealm/protocol/openid-connect/token \
  -d "grant_type=password" \
  -d "client_id=frontend" \
  -d "username=user1" \
  -d "password=password"
```

Response akan berisi field:

```json
{
  "access_token": "..."
}
```

Gunakan token tersebut pada setiap request:

```
Authorization: Bearer <access_token>
```

> **Note**
> Direct Access Grant hanya digunakan untuk kebutuhan development dan testing. Pada production environment disarankan menggunakan Authorization Code Flow dengan PKCE.

---

## Running Tests

Menjalankan seluruh test:

```bash
npm test
```

---

## Security

Backend melakukan beberapa validasi terhadap JWT:

- Signature Verification
- Audience Validation
- Authorized Party Validation
- Role Validation

Selain itu:

- User hanya dapat mengakses note miliknya sendiri.
- Endpoint `/admin` hanya dapat diakses oleh pengguna dengan role `admin`.

---

## Technologies

- Node.js
- Express.js
- MySQL
- Keycloak
- JSON Web Token (JWT)
- JWKS
- Jest

---

## Keycloak

README ini hanya membahas backend.

Dokumentasi konfigurasi Keycloak tersedia pada README terpisah, yang mencakup:

- Import Realm
- Client Configuration
- Roles
- Users
- Direct Access Grant
- Google Identity Provider
- Token Configuration
- Authentication Flow

---

## License

MIT
