
import { WriteQueryResult } from '@viva-eng/database';
import { MysqlError, format } from 'mysql';
import { WriteQuery, schemas, UsersColumns } from '@viva-eng/viva-database';

const tables = schemas.users.tables;
const friends = tables.friends.columns;

export interface AddFriendParams {
	requestingUserId: number;
	requestedUserId: number;
}

/**
 * Query that creates a new user record
 */
class AddFriendQuery extends WriteQuery<AddFriendParams> {
	public readonly template = 'add friend';
	protected readonly prepared = `
		insert into ${tables.friends}
		(
			${friends.requestingUserId},
			${friends.requestedUserId},
			${friends.accepted}
		)
		values
		(?, ?, 0)
	`;

	compile({ requestingUserId, requestedUserId }: AddFriendParams) : string {
		return format(this.prepared, [ requestingUserId, requestedUserId ]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}
}

export const addFriend = new AddFriendQuery();
