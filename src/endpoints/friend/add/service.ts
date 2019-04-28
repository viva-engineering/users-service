
import { logger } from '../../../logger';
import { HttpError } from '@celeri/http-error';
import { TransactionType } from '@viva-eng/database';
import { db, Bit, PrivacyFlag, UserRole } from '@viva-eng/viva-database';
import { AuthenticatedUser } from '../../../middlewares/authenticate';
import { lookupUserIdByUserCode, addFriend } from '../../../queries';

/**
 * Creates a new friend request from the authenticated user to the user given by user code
 *
 * @param user The authenticated user
 * @param userCode The user code of the user to send a friend request to
 */
export const createFriendRequest = async (user: AuthenticatedUser, userCode: string) : Promise<void> => {
	if (user.userCode === userCode) {
		throw new HttpError(400, 'Cannot add self as a friend');
	}

	const userRecords = await lookupUserIdByUserCode.run({ userCode });

	if (! userRecords.length) {
		throw new HttpError(404, 'User with the given user code could not be found');
	}

	const userId = userRecords[0].id;

	await addFriend.run({
		requestingUserId: user.userId,
		requestedUserId: userId
	});
};
