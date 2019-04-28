
import { MysqlError, format } from 'mysql';
import { WriteQueryResult } from '@viva-eng/database';
import { WriteQuery, schemas, UsersColumns } from '@viva-eng/viva-database';

const tables = schemas.users.tables;
const friends = tables.friends.columns;

export interface WithdrawFriendRequestParams {
	requestingUserId: number;
	requestedUserId: number;
}

/**
 * Query that removes an existing friend connection
 */
class WithdrawFriendRequestQuery extends WriteQuery<WithdrawFriendRequestParams> {
	public readonly template = 'remove friend';
	protected readonly prepared = `
		delete ${tables.friends}
		from ${tables.friends}
		where ${friends.accepted} = 0
		  and ${friends.requestingUserId} = ? 
		  and ${friends.requestedUserId} = ?
	`;

	compile({ requestingUserId, requestedUserId }: WithdrawFriendRequestParams) : string {
		return format(this.prepared, [ requestingUserId, requestedUserId ]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}
}

export const withdrawFriendRequest = new WithdrawFriendRequestQuery();
