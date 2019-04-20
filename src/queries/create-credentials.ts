
import { WriteQueryResult } from '@viva-eng/database';
import { WriteQuery, schemas } from '@viva-eng/viva-database';
import { MysqlError, format } from 'mysql';

export interface CreateCredentialsParams {
	userId: number;
	passwordDigest: string;
}

const tables = schemas.users.tables;
const credsTable = tables.credentials.name;
const creds = tables.credentials.columns;

/**
 * Query that creates a new credentials record for a user
 */
export const createCredentials = new class CreateCredentialsQuery extends WriteQuery<CreateCredentialsParams> {
	public readonly prepared: string;
	public readonly template = `insert into ${credsTable} (...) values (...)`;

	constructor() {
		super();

		this.prepared = `
			insert into ${credsTable}
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
	}

	compile({ userId, passwordDigest }: CreateCredentialsParams) : string {
		return format(this.prepared, [ userId, passwordDigest ]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}
}
