
import { logger } from '../../../logger';
import { AuthenticatedUser } from '../../../middlewares/authenticate';
import { countFriendRequests } from '../../../queries';

/**
 * Returns a count of the number of friend requests the user has yet to take action on
 *
 * @param user The authenticated user
 */
export const getFriendRequestCount = async (user: AuthenticatedUser) : Promise<number> => {
	const records = await countFriendRequests.run({ userId: user.userId });

	if (! records.length) {
		throw new Error('Expected exactly one record back from a count query, but got none');
	}

	return records[0].friend_count;
};
