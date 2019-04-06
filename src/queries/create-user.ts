
import { WriteQueryResult } from '@viva-eng/database';
import { WriteQuery, tables } from '@viva-eng/viva-database';
import { MysqlError, format } from 'mysql';

export interface CreateUserParams {
	email: string;
	friendCode: string;
}

/**
 * Query that creates a new user record
 */
export const createUser = new class CreateUserQuery extends WriteQuery<CreateUserParams> {
	public readonly prepared: string;
	public readonly template = `insert into ${tables.users.name} (${tables.users.columns.email}) values (...)`;

	constructor() {
		super();

		this.prepared = `
			insert into ${tables.users.name}
			(${tables.users.columns.email}, ${tables.users.columns.friendCode})
			values
			(?, ?)
		`;
	}

	compile({ email, friendCode }: CreateUserParams) : string {
		return format(this.prepared, [ email, friendCode ]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}
}
