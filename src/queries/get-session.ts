
import { SelectQueryResult } from '@viva-eng/database';
import { SelectQuery, tables } from '@viva-eng/viva-database';
import { MysqlError, format } from 'mysql';

const user = tables.users.columns;
const sess = tables.sessions.columns;
const creds = tables.credentials.columns;

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
export const getSession = new class GetSessionQuery extends SelectQuery<GetSessionParams, GetSessionRecord> {
	public readonly prepared: string;
	public readonly template = `select ... from ${tables.sessions.name} left outer join ${tables.users.name} where ${user.email} = ?`;

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
			from ${tables.sessions.name} sess
			left outer join ${tables.users.name} user
				on user.${user.id} = sess.${sess.userId}
			left outer join ${tables.credentials.name} creds
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
}
