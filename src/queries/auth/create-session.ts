
import { WriteQueryResult } from '@viva-eng/database';
import { MysqlError, format } from 'mysql';
import { WriteQuery, schemas, SessionsColumns } from '@viva-eng/viva-database';

const tables = schemas.users.tables;
const sess = tables.sessions.columns;

export interface CreateSessionParams {
	userId: SessionsColumns[typeof sess.userId];
	token: SessionsColumns[typeof sess.id];
}

/**
 * Query that creates a new active user session
 */
class CreateSessionQuery extends WriteQuery<CreateSessionParams> {
	public readonly template = 'create session';
	protected readonly prepared = `
		insert into ${tables.sessions}
		(
			${sess.id},
			${sess.userId},
			${sess.expiration}
		)
		values
		(?, ?, adddate(now(), interval 30 minute))
	`;

	compile({ userId, token }: CreateSessionParams) : string {
		return format(this.prepared, [ token, userId ]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}
}

export const createSession = new CreateSessionQuery();
