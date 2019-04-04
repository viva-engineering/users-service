
import { db } from '../db';
import { usersTable, credentialsTable } from '../tables';
import { SelectQuery, SelectQueryResult } from '@viva-eng/database';
import { MysqlError, raw, format, PoolConnection } from 'mysql';

const user = usersTable.columns;
const creds = credentialsTable.columns;

export interface GetLoginDetailsRecord {
	user_id: number;
	email: string;
	user_active: 0 | 1;
	email_validated: 0 | 1;
	password_digest: string;
	creds_active: 0 | 1;
	creds_compromised: 0 | 1;
	require_security_question: 0 | 1;
	require_multi_factor: 0 | 1;
	password_expired: boolean;
}

export interface GetLoginDetailsParams {
	email: string;
}

/**
 * Query that fetches all the needed details about a user to perform a login
 */
export class GetLoginDetailsQuery extends SelectQuery<GetLoginDetailsParams, GetLoginDetailsRecord> {
	protected readonly prepared: string;
	
	public readonly template = `select ... from ${usersTable.name} left outer join ${credentialsTable.name} where ${user.email} = ?`;

	constructor() {
		super();

		this.prepared = `
			select
				user.${user.id} as user_id,
				user.${user.email} as email,
				user.${user.active} as user_active,
				user.${user.emailValidated} as email_validated,
				creds.${creds.passwordDigest} as password_digest,
				creds.${creds.isActive} as creds_active,
				creds.${creds.isCompromised} as creds_compromised,
				creds.${creds.requireSecurityQuestion} as require_security_question,
				creds.${creds.requireMultiFactor} as require_multi_factor,
				creds.${creds.passwordExpiration} < now() as password_expired
			from ${usersTable.name} user
			left outer join ${credentialsTable.name} creds
				on user.${user.id} = creds.${creds.userId}
			where user.email = ?
		`;
	}

	compile({ email }: GetLoginDetailsParams) : string {
		return format(this.prepared, [ email ]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}

	async run(params: GetLoginDetailsParams, connection?: PoolConnection) : Promise<GetLoginDetailsRecord> {
		const result = connection
			? await db.runQuery(connection, this, params) as SelectQueryResult<GetLoginDetailsRecord>
			: await db.query(this, params) as SelectQueryResult<GetLoginDetailsRecord>;

		return result.results[0];
	}
}
