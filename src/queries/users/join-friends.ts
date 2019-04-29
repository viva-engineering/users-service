
import { format } from 'mysql';
import { SelectSubQuery, RawQueryFragment } from '@viva-eng/database';
import { schemas, Bit } from '@viva-eng/viva-database';

export interface JoinFriendParams {
	userId: number;
}

const { users, friends } = schemas.users.tables;

const user = users.columns;
const friend = friends.columns;

/**
 * MySQL left outer join onto the friends table to find freinds between a selected user record
 * and a given user ID
 */
class JoinFriendSubQuery extends SelectSubQuery<JoinFriendParams> {
	public readonly columns = { };

	protected readonly prepared = `
		left outer join ${friends} friend
		  on (friend.${friend.requestingUserId} = user.${user.id} and friend.${friend.requestedUserId} = ?)
		  or (friend.${friend.requestedUserId} = user.${user.id} and friend.${friend.requestingUserId} = ?)
	`;

	compile({ userId }: JoinFriendParams) : RawQueryFragment<'left outer join ...'> {
		return this.raw(format(this.prepared, [ userId, userId ]));
	}
}

export const joinFriendSubQuery = new JoinFriendSubQuery();
