const jwt = require('jsonwebtoken')
const jwksClient = require('jwks-rsa')

/**
 * Allowed values (konfigurasi global middleware)
 */
const ALLOWED_AUDIENCE = ['backend']
const ALLOWED_AZP = ['frontend']

/**
 * Error helper
 */
const createError = (status, message) => {
	const err = new Error(message)
	err.status = status
	return err
}

/**
 * JWKS client untuk verify signature JWT dari Keycloak
 */
const client = jwksClient({
	jwksUri:
		'http://localhost:8080/realms/myrealm/protocol/openid-connect/certs'
})

function getKey(header, callback) {
	client.getSigningKey(header.kid, function (err, key) {
		if (err) return callback(err)
		const signingKey = key.getPublicKey()
		callback(null, signingKey)
	})
}

/**
 * requireAuth(role?)
 */
const requireAuth = (role = null) => {
	return (req, res, next) => {
		const authHeader = req.headers.authorization

		if (!authHeader) {
			return next(createError(401, 'No Authorization header'))
		}

		const token = authHeader.split(' ')[1]

		if (!token) {
			return next(createError(401, 'Token missing'))
		}

		jwt.verify(token, getKey, {}, (err, decoded) => {
			if (err) {
				return next(createError(401, 'Invalid or expired token'))
			}

			/**
			 * ===== CHECK AUD =====
			 */
			const aud = decoded.aud
			const audValid = Array.isArray(aud)
				? aud.some((a) => ALLOWED_AUDIENCE.includes(a))
				: ALLOWED_AUDIENCE.includes(aud)

			if (!audValid) {
				return next(createError(403, 'Invalid audience'))
			}

			/**
			 * ===== CHECK AZP =====
			 */
			const azp = decoded.azp
			if (!ALLOWED_AZP.includes(azp)) {
				return next(createError(403, 'Invalid azp (authorized party)'))
			}

			/**
			 * ===== CHECK ROLE (optional) =====
			 */
			if (role) {
				// const roles = decoded.realm_access?.roles || []
				const roles = decoded.resource_access?.frontend?.roles || [];

				if (!roles.includes(role)) {
					return next(createError(403, 'Insufficient role'))
				}
			}

			/**
			 * attach user to request
			 */
			req.user = decoded

			next()
		})
	}
}

module.exports = requireAuth
