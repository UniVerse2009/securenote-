# Keycloak Configuration

Dokumentasi ini menjelaskan konfigurasi Keycloak yang digunakan oleh SecureNote Backend.

Repository ini telah menyediakan file realm sehingga Anda tidak perlu membuat konfigurasi secara manual.

---

## Table of Contents

- [Overview](#overview)
- [Requirements](#requirements)
- [Import Realm](#import-realm)
- [Realm Configuration](#realm-configuration)
- [Authentication Flow](#authentication-flow)
- [Roles](#roles)
- [Token Claims](#token-claims)
- [Direct Access Grant](#direct-access-grant)
- [Token Validation](#token-validation)
- [Troubleshooting](#troubleshooting)
- [Security Notes](#security-notes)

---

## Overview

SecureNote menggunakan Keycloak sebagai Identity and Access Management (IAM).

Keycloak bertanggung jawab untuk:

- Autentikasi pengguna
- Penerbitan JWT Access Token
- Manajemen Role
- OAuth 2.0 / OpenID Connect

Backend hanya memverifikasi token yang diterbitkan Keycloak dan menerapkan otorisasi berdasarkan role.

---

## Requirements

Sebelum melanjutkan, pastikan:

- Keycloak telah terpasang dan dapat dijalankan.
- Backend SecureNote telah di-clone.
- File realm tersedia pada:

```
keycloak/myrealm-realm.json
```

---

## Import Realm

1. Masuk ke halaman administrasi Keycloak.
2. Import file:

```
keycloak/myrealm-realm.json
```

Setelah proses import selesai, realm akan berisi seluruh konfigurasi yang diperlukan oleh SecureNote.

---

## Realm Configuration

Realm yang digunakan:

```
myrealm
```

### Clients

Realm ini memiliki dua client.

**`frontend`**

- Digunakan untuk memperoleh Access Token dari Keycloak.
- Backend memastikan Access Token berasal dari client ini melalui claim `azp`.

**`backend`**

- Digunakan sebagai Audience (`aud`) pada Access Token.
- Backend akan menolak token yang tidak memiliki audience ini.

### Roles

Realm menyediakan role berikut:

| Role    | Description                                              |
|---------|------------------------------------------------------------|
| `admin` | Memberikan akses ke endpoint administratif (`/admin/*`).  |

### Users

Realm menyediakan tiga akun yang dapat langsung digunakan untuk pengujian.

| Username | Password | Role  | Purpose                                                      |
|----------|----------|-------|----------------------------------------------------------------|
| `admin`  | `admin`  | Admin | Menguji endpoint administrasi (`/admin/*`).                   |
| `dummy`  | `dummy`  | User  | Menguji operasi CRUD pada note sebagai pengguna biasa.        |
| `stub`   | `stub`   | User  | Menguji isolasi data antar pengguna (resource ownership).     |

### Suggested Testing Scenarios

**1. User CRUD**

Login sebagai `dummy`, lalu:

- Membuat note
- Melihat daftar note
- Mengubah note
- Menghapus note

**2. Resource Ownership**

Login sebagai `dummy` dan buat beberapa note.

Selanjutnya login sebagai `stub`, kemudian coba mengakses, mengubah, atau menghapus note milik `dummy`.

Backend seharusnya mengembalikan `403 Forbidden`, karena setiap pengguna hanya diperbolehkan mengakses resource miliknya sendiri.

**3. Administrator Access**

Login sebagai `admin`, kemudian akses endpoint:

```
/admin/*
```

Akun administrator dapat mengakses endpoint administratif sesuai role yang dimiliki.

---

## Authentication Flow

SecureNote menggunakan alur autentikasi berikut.

```
                 Username & Password
                         │
                         ▼
                    +------------+
                    | Keycloak   |
                    +------------+
                           │
                     Access Token
                           │
                           ▼
+---------+          +-------------+          +---------+
| Client  | -------> |   Backend   | -------> | MySQL   |
+---------+          +-------------+          +---------+
```

Backend tidak pernah meminta username ataupun password pengguna.

Backend hanya menerima Access Token melalui header:

```
Authorization: Bearer <access_token>
```

---

## Roles

SecureNote menerapkan Role-Based Access Control (RBAC).

| Role                | Permission                          |
|----------------------|---------------------------------------|
| Authenticated User   | CRUD pada note miliknya sendiri      |
| Admin                | Mengakses endpoint `/admin/*`        |

Selain role, backend juga memastikan bahwa pengguna hanya dapat mengakses note miliknya sendiri.

---

## Token Claims

Backend tidak hanya memverifikasi signature JWT, tetapi juga beberapa claim penting.

### Audience (`aud`)

Harus berisi:

```
backend
```

Hal ini memastikan bahwa token memang diterbitkan untuk backend SecureNote.

### Authorized Party (`azp`)

Harus berisi:

```
frontend
```

Backend akan menolak token yang berasal dari client lain.

### Roles

Role diperoleh dari Access Token dan digunakan untuk menentukan hak akses pengguna.

Contohnya, role `admin` memberikan akses ke endpoint administrasi.

---

## Direct Access Grant

Karena repository ini tidak menyertakan frontend, pengujian API dilakukan menggunakan Direct Access Grant.

Pastikan opsi Direct Access Grant telah diaktifkan pada client `frontend`.

Contoh memperoleh Access Token:

```bash
curl -X POST \
  http://localhost:8080/realms/myrealm/protocol/openid-connect/token \
  -d "grant_type=password" \
  -d "client_id=frontend" \
  -d "username=dummy" \
  -d "password=dummy"
```

Response akan berisi:

```json
{
  "access_token": "..."
}
```

Gunakan token tersebut pada setiap request ke backend:

```
Authorization: Bearer <access_token>
```

> **Note**
> Direct Access Grant hanya digunakan untuk development dan testing. Pada production environment disarankan menggunakan Authorization Code Flow dengan PKCE.

---

## Token Validation

Backend menggunakan offline JWT validation.

Alur validasi:

```
Access Token
      │
      ▼
Read Header (kid)
      │
      ▼
Request Public Key (JWKS)
      │
      ▼
Verify Signature
      │
      ▼
Validate Claims
```

Public key diperoleh dari endpoint:

```
/realms/myrealm/protocol/openid-connect/certs
```

Karena menggunakan JWKS, backend tidak memerlukan JWT secret untuk memverifikasi token.

---

## Troubleshooting

### 401 Invalid or Expired Token

Kemungkinan penyebab:

- Token telah kedaluwarsa.
- Signature token tidak valid.
- Realm yang digunakan salah.
- Issuer tidak sesuai.

### 403 Invalid Audience

Penyebab: token tidak memiliki audience `backend`.

### 403 Invalid Authorized Party

Penyebab: claim `azp` bukan `frontend`.

### 403 Insufficient Role

Penyebab: pengguna belum memiliki role `admin`.

### 403 Forbidden

Penyebab: pengguna mencoba mengakses atau memodifikasi note milik pengguna lain.

---

## Security Notes

SecureNote menerapkan beberapa lapisan validasi terhadap JWT:

- Signature Verification menggunakan JWKS.
- Audience Validation (`aud`).
- Authorized Party Validation (`azp`).
- Role Validation.
- Resource Ownership Validation.

Pendekatan ini memungkinkan backend memverifikasi token secara lokal tanpa melakukan token introspection ke Keycloak pada setiap request. Hal ini mengurangi latensi sekaligus tetap mempertahankan keamanan selama Access Token masih berlaku.
