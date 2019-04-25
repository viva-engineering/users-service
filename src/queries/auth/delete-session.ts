
import { WriteQueryResult } from '@viva-eng/database';
import { MysqlError, format } from 'mysql';
import { WriteQuery, schemas, SessionsColumns } from '@viva-eng/viva-database';

const tables = schemas.users.tables;
const sess = tables.sessions.columns;

export interface DeleteSessionParams {
	token: SessionsColumns[typeof sess.id];
}

/**
 * Query that deletes an existing session record
 */
class DeleteSessionQuery extends WriteQuery<DeleteSessionParams> {
	public readonly template = 'delete session';
	protected readonly prepared = `
		delete ${tables.sessions}
		from ${tables.sessions}
		where ${sess.id} = ?
	`;

	compile({ token }: DeleteSessionParams) : string {
		return format(this.prepared, [ token ]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}
}

export const deleteSession = new DeleteSessionQuery();
