
import { SelectQueryResult } from '@viva-eng/database';
import { SelectQuery, tables } from '@viva-eng/viva-database';
import { MysqlError, format } from 'mysql';

const user = tables.users.columns;

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
class LookupUserIdByEmailQuery extends SelectQuery<LookUserIdByEmailParams, LookupUserIdByEmailRecord> {
	public readonly prepared: string;
	public readonly template = `select ${user.id}, ${user.email} from ${tables.users.name} where ${user.email} = ?`;

	constructor() {
		super();

		this.prepared = `
			select
				${user.id} as id,
				${user.email} as email
			from ${tables.users.name}
			where email = ?
		`;
	}

	compile({ email }: LookUserIdByEmailParams) : string {
		return format(this.prepared, [ email ]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}
}

export const lookupUserIdByEmail = new LookupUserIdByEmailQuery();
