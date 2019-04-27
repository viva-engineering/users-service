
import { SelectQueryResult } from '@viva-eng/database';
import { SelectQuery, schemas, UsersColumns, Record } from '@viva-eng/viva-database';
import { MysqlError, format } from 'mysql';

const tables = schemas.users.tables;
const user = tables.users.columns;

type SelectList
	= typeof user.id
	| typeof user.email;

export type LookupUserIdByEmailRecord = Record<UsersColumns, SelectList, { }>;

export interface LookUserIdByEmailParams {
	email: UsersColumns[typeof user.email];
}

/**
 * Query that looks up a user's user ID by their email address
 */
class LookupUserIdByEmailQuery extends SelectQuery<LookUserIdByEmailParams, LookupUserIdByEmailRecord> {
	public readonly template = 'lookup user by email';
	protected readonly prepared = `
		select
			${user.id},
			${user.email}
		from ${tables.users}
		where ${user.email} = ?
	`;

	compile({ email }: LookUserIdByEmailParams) : string {
		return format(this.prepared, [ email ]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}
}

export const lookupUserIdByEmail = new LookupUserIdByEmailQuery();
