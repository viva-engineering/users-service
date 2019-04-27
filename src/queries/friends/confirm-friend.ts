
import { MysqlError, format } from 'mysql';
import { WriteQueryResult } from '@viva-eng/database';
import { WriteQuery, schemas, UsersColumns } from '@viva-eng/viva-database';

const tables = schemas.users.tables;
const friends = tables.friends.columns;

export interface ConfirmFriendParams {
	requestingUserId: number;
	requestedUserId: number;
}

/**
 * Query that confirms an existing friend request
 */
class ConfirmFriendQuery extends WriteQuery<ConfirmFriendParams> {
	public readonly template = 'confirm friend';
	protected readonly prepared = `
		update ${tables.friends}
		set ${friends.accepted} = 1
		where ${friends.requestingUserId} = ?
		  and ${friends.requestedUserId} = ?
		  and ${friends.accepted} = 0
	`;

	compile({ requestingUserId, requestedUserId }: ConfirmFriendParams) : string {
		return format(this.prepared, [ requestingUserId, requestedUserId ]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}
}

export const confirmFriend = new ConfirmFriendQuery();
