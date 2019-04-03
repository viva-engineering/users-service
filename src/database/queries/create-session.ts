
import { db } from '../index';
import { sessionsTable } from '../tables';
import { WriteQuery, WriteQueryResult } from '@viva-eng/database';
import { MysqlError, raw, format, PoolConnection } from 'mysql';

export interface CreateSessionParams {
	userId: number;
	token: string;
}

/**
 * Query that creates a new credentials record for a user
 */
export class CreateSessionQuery extends WriteQuery<CreateSessionParams> {
	protected readonly prepared: string;

	public readonly template = `insert into ${sessionsTable.name} (...) values (...)`;

	constructor() {
		super();

		this.prepared = `
			insert into ${sessionsTable.name}
			(
				${sessionsTable.columns.id},
				${sessionsTable.columns.userId},
				${sessionsTable.columns.expiration}
			)
			values
			(?, ?, adddate(now(), interval 30 minute))
		`;
	}

	compile({ userId, token }: CreateSessionParams) : string {
		return format(this.prepared, [ token, userId ]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}

	async run(params: CreateSessionParams, connection?: PoolConnection) : Promise<WriteQueryResult> {
		const result = connection
			? await db.runQuery(connection, this, params) as WriteQueryResult
			: await db.query(this, params) as WriteQueryResult;

		return result;
	}
}
