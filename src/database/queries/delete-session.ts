
import { db } from '../db';
import { sessionsTable } from '../tables';
import { WriteQuery, WriteQueryResult } from '@viva-eng/database';
import { MysqlError, raw, format, PoolConnection } from 'mysql';

export interface DeleteSessionParams {
	token: string;
}

/**
 * Query that creates a new credentials record for a user
 */
export class DeleteSessionQuery extends WriteQuery<DeleteSessionParams> {
	protected readonly prepared: string;

	public readonly template = `delete ${sessionsTable.name} from ${sessionsTable.name} where ${sessionsTable.columns.id} = ?`;

	constructor() {
		super();

		this.prepared = `
			delete ${sessionsTable.name}
			from ${sessionsTable.name}
			where ${sessionsTable.columns.id} = ?
		`;
	}

	compile({ token }: DeleteSessionParams) : string {
		return format(this.prepared, [ token ]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}

	async run(params: DeleteSessionParams, connection?: PoolConnection) : Promise<WriteQueryResult> {
		const result = connection
			? await db.runQuery(connection, this, params) as WriteQueryResult
			: await db.query(this, params) as WriteQueryResult;

		return result;
	}
}
