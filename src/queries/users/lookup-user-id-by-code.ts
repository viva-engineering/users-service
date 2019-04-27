
import { SelectQueryResult } from '@viva-eng/database';
import { SelectQuery, schemas, UsersColumns, Record } from '@viva-eng/viva-database';
import { MysqlError, format } from 'mysql';

const tables = schemas.users.tables;
const user = tables.users.columns;

type SelectList
	= typeof user.id
	| typeof user.userCode;

export type LookupUserIdByUserCodeRecord = Record<UsersColumns, SelectList, { }>;

export interface LookUserIdByUserCodeParams {
	userCode: UsersColumns[typeof user.userCode];
}

/**
 * Query that looks up a user's user ID by their user code
 */
class LookupUserIdByUserCodeQuery extends SelectQuery<LookUserIdByUserCodeParams, LookupUserIdByUserCodeRecord> {
	public readonly template = 'lookup user by code';
	protected readonly prepared = `
		select
			${user.id},
			${user.userCode}
		from ${tables.users}
		where ${user.userCode} = ?
	`;

	compile({ userCode }: LookUserIdByUserCodeParams) : string {
		return format(this.prepared, [ userCode ]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}
}

export const lookupUserIdByUserCode = new LookupUserIdByUserCodeQuery();
