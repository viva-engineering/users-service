
export const credentialsTable = Object.freeze({
	name: 'credentials',
	columns: {
		userId: 'user_id',
		passwordDigest: 'password_digest',
		isActive: 'is_active',
		isCompromised: 'is_compromised',
		requireSecurityQuestion: 'require_security_question',
		requireMultiFactor: 'require_multi_factor',
		passwordExpiration: 'password_expiration',
		createdTimestamp: 'created_timestamp',
		updatedTimestamp: 'updated_timestamp'
	}
});
