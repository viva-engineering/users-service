
import { format } from 'mysql';
import { SelectSubQuery, RawQueryFragment } from '@viva-eng/database';
import { schemas, Bit } from '@viva-eng/viva-database';

export interface FriendIdsParams {
	userId: number;
	fromUser?: boolean;
	toUser?: boolean;
	accepted: Bit;
}

const friends = schemas.users.tables.friends;
const friend = friends.columns;

/**
 * Sub-Query that results in a list of user IDs for all of a user's friends
 */
class FriendIdsSubQuery extends SelectSubQuery<FriendIdsParams> {
	public readonly columns = {
		userId: 'user_id' as const
	};

	protected readonly prepared = {
		fromUser: `
			select
			  ${friend.requestedUserId} as user_id
			from ${friends}
			where ${friend.requestingUserId} = ?
			  and ${friend.accepted} = ?
		`,
		toUser: `
			select
			  ${friend.requestingUserId} as user_id
			from ${friends}
			where ${friend.requestedUserId} = ?
			  and ${friend.accepted} = ?
		`
	};

	compile({ userId, fromUser, toUser, accepted }: FriendIdsParams) : RawQueryFragment<'select user_id'> {
		const segments = [ ];

		if (fromUser) {
			segments.push(format(this.prepared.fromUser, [ userId, accepted ]));
		}

		if (toUser) {
			segments.push(format(this.prepared.toUser, [ userId, accepted ]));
		}

		return this.raw(segments.join(' union '));
	}
}

export const friendIdsSubQuery = new FriendIdsSubQuery();
