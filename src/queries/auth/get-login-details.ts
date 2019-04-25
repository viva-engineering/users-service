
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
const user = tables.users.columns;
const creds = tables.credentials.columns;

type UserSelectList
	= typeof user.id
	| typeof user.email
	| typeof user.active
	| typeof user.emailValidated;

type CredsSelectList
	= typeof creds.passwordDigest
	| typeof creds.isCompromised
	| typeof creds.requireSecurityQuestion
	| typeof creds.requireMultiFactor;

export type GetLoginDetailsRecord 
	= Record<UsersColumns, UserSelectList, { }>
	& Record<CredentialsColumns, CredsSelectList, {
		password_expired: boolean;
		creds_active: CredentialsColumns[typeof creds.isActive];
	}>;

export interface GetLoginDetailsParams {
	email: UsersColumns[typeof user.email];
}

/**
 * Query that fetches all the needed details about a user to perform a login
 */
class GetLoginDetailsQuery extends SelectQuery<GetLoginDetailsParams, GetLoginDetailsRecord> {
	public readonly template = 'get login details';
	protected readonly prepared = `
		select
			user.${user.id},
			user.${user.email},
			user.${user.active},
			user.${user.emailValidated},
			creds.${creds.passwordDigest},
			creds.${creds.isCompromised},
			creds.${creds.requireSecurityQuestion},
			creds.${creds.requireMultiFactor},
			creds.${creds.isActive} as creds_active,
			creds.${creds.passwordExpiration} < now() as password_expired
		from ${tables.users} user
		left outer join ${tables.credentials} creds
			on user.${user.id} = creds.${creds.userId}
		where user.email = ?
	`;

	compile({ email }: GetLoginDetailsParams) : string {
		return format(this.prepared, [ email ]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}
}

export const getLoginDetails = new GetLoginDetailsQuery();
