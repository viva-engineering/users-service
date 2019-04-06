
import { WriteQueryResult } from '@viva-eng/database';
import { WriteQuery, tables } from '@viva-eng/viva-database';
import { MysqlError, format } from 'mysql';

export interface DeleteSessionParams {
	token: string;
}

/**
 * Query that creates a new credentials record for a user
 */
export const deleteSession = new class DeleteSessionQuery extends WriteQuery<DeleteSessionParams> {
	public readonly prepared: string;
	public readonly template = `delete ${tables.sessions.name} from ${tables.sessions.name} where ${tables.sessions.columns.id} = ?`;

	constructor() {
		super();

		this.prepared = `
			delete ${tables.sessions.name}
			from ${tables.sessions.name}
			where ${tables.sessions.columns.id} = ?
		`;
	}

	compile({ token }: DeleteSessionParams) : string {
		return format(this.prepared, [ token ]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}
}
