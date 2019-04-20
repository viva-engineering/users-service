
import { WriteQueryResult } from '@viva-eng/database';
import { WriteQuery, schemas } from '@viva-eng/viva-database';
import { MysqlError, format } from 'mysql';

export interface CreateUserNoteParams {
	userId: number;
	token: string;
}

const tables = schemas.users.tables;
const sess = tables.sessions.columns;

/**
 * Query that creates a new credentials record for a user
 */
export const createUserNote = new class CreateUserNoteQuery extends WriteQuery<CreateUserNoteParams> {
	public readonly prepared: string;
	public readonly template = `insert into ${tables.sessions.name} (...) values (...)`;

	constructor() {
		super();

		this.prepared = `
			insert into ${tables.sessions.name}
			(
				${sess.id},
				${sess.userId},
				${sess.expiration}
			)
			values
			(?, ?, adddate(now(), interval 30 minute))
		`;
	}

	compile({ userId, token }: CreateUserNoteParams) : string {
		return format(this.prepared, [ token, userId ]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}
}
