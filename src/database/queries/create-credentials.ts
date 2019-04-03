
import { db } from '../index';
import { credentialsTable } from '../tables';
import { WriteQuery, WriteQueryResult } from '@viva-eng/database';
import { MysqlError, raw, format, PoolConnection } from 'mysql';

export interface CreateCredentialsParams {
	userId: number;
	passwordDigest: string;
}

/**
 * Query that creates a new credentials record for a user
 */
export class CreateCredentialsQuery extends WriteQuery<CreateCredentialsParams> {
	protected readonly prepared: string;

	public readonly template = `insert into ${credentialsTable.name} (...) values (...)`;

	constructor() {
		super();

		this.prepared = `
			insert into ${credentialsTable.name}
			(
				${credentialsTable.columns.userId},
				${credentialsTable.columns.passwordDigest},
				${credentialsTable.columns.isActive},
				${credentialsTable.columns.isCompromised},
				${credentialsTable.columns.requireSecurityQuestion},
				${credentialsTable.columns.requireMultiFactor},
				${credentialsTable.columns.passwordExpiration}
			)
			values
			(?, ?, 1, 0, 0, 0, adddate(now(), interval 3 month))
		`;
	}

	compile({ userId, passwordDigest }: CreateCredentialsParams) : string {
		return format(this.prepared, [ userId, passwordDigest ]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}

	async run(params: CreateCredentialsParams, connection?: PoolConnection) : Promise<WriteQueryResult> {
		const result = connection
			? await db.runQuery(connection, this, params) as WriteQueryResult
			: await db.query(this, params) as WriteQueryResult;

		return result;
	}
}
