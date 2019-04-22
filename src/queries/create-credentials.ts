
import { WriteQueryResult } from '@viva-eng/database';
import { MysqlError, format } from 'mysql';
import { WriteQuery, schemas, CredentialsColumns } from '@viva-eng/viva-database';

const tables = schemas.users.tables;
const creds = tables.credentials.columns;

export interface CreateCredentialsParams {
	userId: CredentialsColumns[typeof creds.userId];
	passwordDigest: CredentialsColumns[typeof creds.passwordDigest];
}

/**
 * Query that creates a new credentials record for a user
 */
class CreateCredentialsQuery extends WriteQuery<CreateCredentialsParams> {
	public readonly template = 'create credentials';
	protected readonly prepared = `
		insert into ${tables.credentials}
		(
			${creds.userId},
			${creds.passwordDigest},
			${creds.isActive},
			${creds.isCompromised},
			${creds.requireSecurityQuestion},
			${creds.requireMultiFactor},
			${creds.passwordExpiration}
		)
		values
		(?, ?, 1, 0, 0, 0, adddate(now(), interval 3 month))
	`;

	compile({ userId, passwordDigest }: CreateCredentialsParams) : string {
		return format(this.prepared, [ userId, passwordDigest ]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}
}

export const createCredentials = new CreateCredentialsQuery();
