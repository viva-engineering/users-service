
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

export interface CountFriendRequestsParams {
	userId: number;
}

export interface CountFriendRequestsRecord {
	friend_count: number;
}

/**
 * Query that returns a total count of open friend requests that a user has
 */
class CountFriendRequestsQuery extends SelectQuery<CountFriendRequestsParams, CountFriendRequestsRecord> {
	public readonly template = 'count friends';
	protected readonly prepared = `
		select
		  count(friend.${friendIdsSubQuery.columns.userId}) as friend_count
		from (?) friend
		left outer join users user
		  on user.id = friend.user_id
	`;

	compile({ userId }: CountFriendRequestsParams) : string {
		const friendIds = friendIdsSubQuery.compile({
			userId,
			accepted: 0,
			toUser: true
		});

		return format(this.prepared, [ friendIds ]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}
}

export const countFriendRequests = new CountFriendRequestsQuery();
