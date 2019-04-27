
import { MysqlError, format } from 'mysql';
import { WriteQueryResult } from '@viva-eng/database';
import { WriteQuery, schemas, UsersColumns } from '@viva-eng/viva-database';

const tables = schemas.users.tables;
const friends = tables.friends.columns;

export interface RemoveFriendParams {
	userIdA: number;
	userIdB: number;
}

/**
 * Query that removes an existing friend connection
 */
class RemoveFriendQuery extends WriteQuery<RemoveFriendParams> {
	public readonly template = 'remove friend';
	protected readonly prepared = `
		delete ${tables.friends}
		from ${tables.friends}
		where ${friends.accepted} = 1
		  and ((${friends.requestingUserId} = ? and ${friends.requestedUserId} = ?)
		    or (${friends.requestingUserId} = ? and ${friends.requestedUserId} = ?)
		  )
	`;

	compile({ userIdA, userIdB }: RemoveFriendParams) : string {
		return format(this.prepared, [ userIdA, userIdB, userIdB, userIdA ]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}
}

export const removeFriend = new RemoveFriendQuery();
