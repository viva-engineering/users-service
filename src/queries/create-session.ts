
import { WriteQueryResult } from '@viva-eng/database';
import { WriteQuery, schemas } from '@viva-eng/viva-database';
import { MysqlError, format } from 'mysql';

export interface CreateSessionParams {
	userId: number;
	token: string;
}

const tables = schemas.users.tables;
const sessTable = tables.sessions.name;
const sess = tables.sessions.columns;

/**
 * Query that creates a new credentials record for a user
 */
export const createSession = new class CreateSessionQuery extends WriteQuery<CreateSessionParams> {
	public readonly prepared: string;
	public readonly template = `insert into ${sessTable} (...) values (...)`;

	constructor() {
		super();

		this.prepared = `
			insert into ${sessTable}
			(
				${sess.id},
				${sess.userId},
				${sess.expiration}
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
}

