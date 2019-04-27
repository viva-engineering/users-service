
import { MysqlError, format } from 'mysql';
import { WriteQueryResult } from '@viva-eng/database';
import { WriteQuery, schemas, UsersColumns } from '@viva-eng/viva-database';

const tables = schemas.users.tables;
const friends = tables.friends.columns;

export interface DeclineFriendParams {
	requestingUserId: number;
	requestedUserId: number;
}

/**
 * Query that declines an existing friend request
 */
class DeclineFriendQuery extends WriteQuery<DeclineFriendParams> {
	public readonly template = 'decline friend';
	protected readonly prepared = `
		delete ${tables.friends}
		from ${tables.friends}
		where ${friends.requestingUserId} = ?
		  and ${friends.requestedUserId} = ?
		  and ${friends.accepted} = 0
	`;

	compile({ requestingUserId, requestedUserId }: DeclineFriendParams) : string {
		return format(this.prepared, [ requestingUserId, requestedUserId ]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}
}

export const declineFriend = new DeclineFriendQuery();
