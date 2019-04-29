
import { format } from 'mysql';
import { SelectSubQuery, RawQueryFragment } from '@viva-eng/database';
import { schemas, Bit } from '@viva-eng/viva-database';

export const enum FriendStatus {
	None = 0,
	RequestSent = 1,
	RequestReceived = 2,
	Friends = 3
}

export interface FriendStatusParams {
	userId: number;
}

const friends = schemas.users.tables.friends;
const friend = friends.columns;

/**
 * MySQL case statement for turning a joined table (aliased as "friend") into a FriendStatus
 * enum value
 */
class FriendStatusSubQuery extends SelectSubQuery<FriendStatusParams> {
	public readonly columns = { };

	protected readonly prepared = `
		case
		  when friend.accepted = 1 then ${FriendStatus.Friends}
		  when friend.requestingUserId = ? then ${FriendStatus.RequestSent}
		  when friend.requestedUserId = ? then ${FriendStatus.RequestReceived}
		  else ${FriendStatus.None}
		end
	`;

	compile({ userId }: FriendStatusParams) : RawQueryFragment<'case ... end'> {
		return this.raw(format(this.prepared, [ userId, userId ]));
	}
}

export const friendStatusSubQuery = new FriendStatusSubQuery();
