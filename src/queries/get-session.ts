
import { SelectQueryResult } from '@viva-eng/database';
import { MysqlError, format } from 'mysql';
import {
	SelectQuery,
	Record,
	schemas,
	UsersColumns,
	SessionsColumns,
	CredentialsColumns,
	UserRolesColumns,
	UserRole
} from '@viva-eng/viva-database';

const tables = schemas.users.tables;
const sess = tables.sessions.columns;
const user = tables.users.columns;
const role = tables.userRoles.columns;
const creds = tables.credentials.columns;

type SelectList
	= typeof user.id
	| typeof user.userCode
	| typeof user.email
	| typeof user.name
	| typeof user.active
	| typeof user.emailValidated;

export type GetSessionRecord = Record<UsersColumns, SelectList, {
	password_expired: boolean;
	session_expired: boolean;
	user_role: UserRole;
}>;

export interface GetSessionParams {
	token: string;
}

/**
 * Query that fetches a users session and some basic user data
 */
export const getSession = new class GetSessionQuery extends SelectQuery<GetSessionParams, GetSessionRecord> {
	public readonly prepared: string;
	public readonly template = `select ... from ${tables.sessions.name}, ${tables.users.name}, ${tables.credentials.name}, ${tables.userRoles.name} where ${user.email} = ?`;

	constructor() {
		super();

		this.prepared = `
			select
				user.${user.id},
				user.${user.userCode},
				user.${user.email},
				user.${user.name},
				user.${user.active},
				user.${user.emailValidated},
				role.${role.description} as user_role,
				creds.${creds.passwordExpiration} < now() as password_expired,
				sess.${sess.expiration} < now() as session_expired
			from ${tables.sessions.name} sess
			left outer join ${tables.users.name} user
				on user.${user.id} = sess.${sess.userId}
			left outer join ${tables.userRoles} role
				on role.${role.id} = user.${user.userRoleId}
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
