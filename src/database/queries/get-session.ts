
import { db } from '../db';
import { usersTable, sessionsTable, credentialsTable } from '../tables';
import { SelectQuery, SelectQueryResult } from '@viva-eng/database';
import { MysqlError, raw, format, PoolConnection } from 'mysql';

const user = usersTable.columns;
const sess = sessionsTable.columns;
const creds = credentialsTable.columns;

export interface GetSessionRecord {
	user_id: number;
	email: string;
	name: string;
	user_active: 0 | 1;
	email_validated: 0 | 1;
	session_expired: boolean;
	password_expired: boolean;
}

export interface GetSessionParams {
	token: string;
}

/**
 * Query that fetches a users session and some basic user data
 */
export class GetSessionQuery extends SelectQuery<GetSessionParams, GetSessionRecord> {
	protected readonly prepared: string;

	public readonly template = `select ... from ${sessionsTable.name} left outer join ${usersTable.name} where ${user.email} = ?`;

	constructor() {
		super();

		this.prepared = `
			select
				user.${user.id} as user_id,
				user.${user.email} as email,
				user.${user.name} as name,
				user.${user.active} as user_active,
				user.${user.emailValidated} as email_validated,
				creds.${creds.passwordExpiration} < now() as password_expired,
				sess.${sess.expiration} < now() as session_expired
			from ${sessionsTable.name} sess
			left outer join ${usersTable.name} user
				on user.${user.id} = sess.${sess.userId}
			left outer join ${credentialsTable.name} creds
				on creds.${creds.userId} = user.${user.id}
			where sess.${sess.id} = ?
		`;
	}

	compile({ token }: GetSessionParams) : string {
		return format(this.prepared, [ token ]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}

	async run(params: GetSessionParams, connection?: PoolConnection) : Promise<GetSessionRecord> {
		const result = connection
			? await db.runQuery(connection, this, params) as SelectQueryResult<GetSessionRecord>
			: await db.query(this, params) as SelectQueryResult<GetSessionRecord>;

		return result.results[0];
	}
}
