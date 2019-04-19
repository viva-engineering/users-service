
import { WriteQueryResult } from '@viva-eng/database';
import { WriteQuery, tables } from '@viva-eng/viva-database';
import { MysqlError, format } from 'mysql';

/**
 * The default value used for the user privacy settings on a new user. The ID 1 always
 * represents a fully private profile due to 0 being the first value in each of the cross
 * joined tables in the population query
 */
const defaultPrivacySettings = 1;

const user = tables.users.columns;

export interface CreateUserParams {
	email: string;
	userCode: string;
}

/**
 * Query that creates a new user record
 */
export const createUser = new class CreateUserQuery extends WriteQuery<CreateUserParams> {
	public readonly prepared: string;
	public readonly template = `insert into ${tables.users.name} (${user.email}) values (...)`;

	constructor() {
		super();

		// NOTE: Setting email_validated to 1 by default is temporary until verification is built
		this.prepared = `
			insert into ${tables.users.name}
			(${user.email}, ${user.userCode}, ${user.privacySettingsId}, ${user.emailValidated})
			values
			(?, ?, ${defaultPrivacySettings}, 1)
		`;
	}

	compile({ email, userCode }: CreateUserParams) : string {
		return format(this.prepared, [ email, userCode ]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}
}
