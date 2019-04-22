
import { WriteQueryResult } from '@viva-eng/database';
import { MysqlError, format } from 'mysql';
import { WriteQuery, schemas, UsersColumns } from '@viva-eng/viva-database';

/**
 * The default value used for the user privacy settings on a new user. The ID 1 always
 * represents a fully private profile due to 0 being the first value in each of the cross
 * joined tables in the population query
 */
const defaultPrivacySettings = 1;

const tables = schemas.users.tables;
const user = tables.users.columns;

export interface CreateUserParams {
	email: UsersColumns[typeof user.email];
	userCode: UsersColumns[typeof user.userCode];
}

/**
 * Query that creates a new user record
 */
class CreateUserQuery extends WriteQuery<CreateUserParams> {
	public readonly template = 'create user';
	// FIXME: Setting email_validated to 1 by default is temporary until verification is built
	protected readonly prepared = `
		insert into ${tables.users}
		(
			${user.email},
			${user.userCode},
			${user.privacySettingsId},
			${user.emailValidated})
		values
		(?, ?, ${defaultPrivacySettings}, 1)
	`;

	compile({ email, userCode }: CreateUserParams) : string {
		return format(this.prepared, [ email, userCode ]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}
}

export const createUser = new CreateUserQuery();
