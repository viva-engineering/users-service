
import { db } from '../index';
import { userTable } from '../tables';
import { WriteQuery, WriteQueryResult } from '@viva-eng/database';
import { MysqlError, raw, format, PoolConnection } from 'mysql';

export interface CreateUserParams {
	email: string;
}

/**
 * Query that creates a new user record
 */
export class CreateUserQuery extends WriteQuery<CreateUserParams> {
	protected readonly prepared: string;

	constructor() {
		super();

		this.prepared = `
			insert into ${userTable.name}
			(${userTable.columns.email})
			values
			(?)
		`;
	}

	compile({ email }: CreateUserParams) : string {
		return format(this.prepared, [ email ]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}

	toString() {
		return 'insert into users (email) values (...)';
	}

	async run(params: CreateUserParams, connection?: PoolConnection) : Promise<WriteQueryResult> {
		const result = connection
			? await db.runQuery(connection, this, params) as WriteQueryResult
			: await db.query(this, params) as WriteQueryResult;

		return result;
	}
}