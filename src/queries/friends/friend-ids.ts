
import { format } from 'mysql';
import { SelectSubQuery } from '@viva-eng/database';
import { schemas, Bit } from '@viva-eng/viva-database';

export interface FriendIdsParams {
	userId: number;
	accepted: Bit;
}

const friends = schemas.users.tables.friends;
const friend = friends.columns;

/**
 * Sub-Query that results in a list of user IDs for all of a user's friends
 */
class FriendIdsSubQuery extends SelectSubQuery<FriendIdsParams> {
	protected readonly prepared: string;

	public readonly columns = {
		userId: 'user_id' as const
	};

	constructor() {
		super();

		this.prepared = `
			select
				${friend.requestingUserId} as user_id
			from ${friends}
				where ${friend.requestedUserId} = ?
				and ${friend.accepted} = ?
			union
			select
				${friend.requestedUserId} as user_id
			from ${friends}
			where ${friend.requestingUserId} = ?
				and ${friend.accepted} = ?
		`;
	}

	compile({ userId, accepted }: FriendIdsParams) {
		return this.raw(format(this.prepared, [ userId, accepted, userId, accepted ]));
	}
}

export const friendIdsSubQuery = new FriendIdsSubQuery();
