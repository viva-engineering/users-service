
import { SelectQueryResult } from '@viva-eng/database';
import { MysqlError, format } from 'mysql';
import { AuthenticatedUser } from '../../middlewares/authenticate';
import { HttpError } from '@celeri/http-error';
import { friendIdsSubQuery } from './friend-ids';
import {
	SelectQuery,
	schemas,
	Record,
	UsersColumns,
	UserRolesColumns,
	UserPrivacySettingsColumns,
	UserRole
} from '@viva-eng/viva-database';

export interface CountFriendsParams {
	userId: number;
	page: number;
}

export interface CountFriendsRecord {
	friend_count: number;
}

/**
 * Query that returns a total count of friends that a user has
 */
class CountFriendsQuery extends SelectQuery<CountFriendsParams, CountFriendsRecord> {
	public readonly template = 'count friends';
	protected readonly prepared: string;

	constructor() {
		super();

		this.prepared = `
			select
				count(friend.${friendIdsSubQuery.columns.userId}) as friend_count
			from (?) friend
			left outer join users user
				on user.id = friend.user_id
		`;
	}

	compile({ userId }: CountFriendsParams) : string {
		const friendIds = friendIdsSubQuery.compile({ userId, accepted: 1 });

		return format(this.prepared, [ friendIds ]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}
}

export const countFriends = new CountFriendsQuery();
