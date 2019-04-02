
import { db } from '../index';
import { userTable } from '../tables';
import { SelectQuery, SelectQueryResult } from '@viva-eng/database';
import { MysqlError, raw, format, PoolConnection } from 'mysql';

export interface LookupUserIdByEmailRecord {
	id: number;
	email: string;
}

export interface LookUserIdByEmailParams {
	email: string;
}

/**
 * Query that looks up a user's user ID by their email address
 */
export class LookupUserIdByEmailQuery extends SelectQuery<LookUserIdByEmailParams, LookupUserIdByEmailRecord> {
	protected readonly prepared: string;

	constructor() {
		super();

		this.prepared = `
			select
				${userTable.columns.id},
				${userTable.columns.email}
			from ${userTable.name}
			where email = ?
		`;
	}

	compile({ email }: LookUserIdByEmailParams) : string {
		return format(this.prepared, [ email ]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}

	toString() {
		return 'select id, email from users where email = ?';
	}

	async run(params: LookUserIdByEmailParams, connection?: PoolConnection) : Promise<LookupUserIdByEmailRecord[]> {
		const result = connection
			? await db.runQuery(connection, this, params) as SelectQueryResult<LookupUserIdByEmailRecord>
			: await db.query(this, params) as SelectQueryResult<LookupUserIdByEmailRecord>;

		return result.results;
	}
}
