
import { db } from '../index';
import { userTable } from '../tables';
import { SelectQuery, SelectQueryResult } from '@viva-eng/database';
import { MysqlError, raw, format, PoolConnection } from 'mysql';

const user = userTable.columns;

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

	public readonly template = `select ${user.id}, ${user.email} from ${userTable.name} where ${user.email} = ?`;

	constructor() {
		super();

		this.prepared = `
			select
				${user.id},
				${user.email}
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

	async run(params: LookUserIdByEmailParams, connection?: PoolConnection) : Promise<LookupUserIdByEmailRecord> {
		const result = connection
			? await db.runQuery(connection, this, params) as SelectQueryResult<LookupUserIdByEmailRecord>
			: await db.query(this, params) as SelectQueryResult<LookupUserIdByEmailRecord>;

		return result.results[0];
	}
}
