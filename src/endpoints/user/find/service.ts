
import { logger } from '../../../logger';
import { HttpError } from '@celeri/http-error';
import { TransactionType } from '@viva-eng/database';
import { db, Bit, PrivacyFlag, UserRole } from '@viva-eng/viva-database';
import { QueryParams } from './params';
import { AuthenticatedUser } from '../../../middlewares/authenticate';
import { searchUser, FriendStatus } from '../../../queries';

const privilegedRoles = new Set([
	UserRole.System,
	UserRole.Admin,
	UserRole.SuperModerator,
	UserRole.Moderator
]);

export interface FindUserResult {
	userCode: string;
	active: Bit;
	name: string;
	email?: string;
	phone?: string;
	location?: string;
	birthday?: string;
	userRole: UserRole;
	friendStatus: FriendStatus;
	isSelf?: true;
}

/**
 * Performs a search for users matching the given criteria
 */
export const findUsers = async (query: QueryParams, searchAs: AuthenticatedUser) : Promise<FindUserResult[]> => {
	const isPrivileged = privilegedRoles.has(searchAs.userRole);

	if (query.userId && ! isPrivileged) {
		throw new HttpError(403, 'Not Authorized');
	}

	try {
		const records = await searchUser.run({
			name: query.name,
			email: query.email,
			phone: query.phone,
			userId: query.userId,
			userCode: query.userCode,
			searchAsUserId: searchAs.userId,
			isPrivileged
		});

		return records.map((record) => {
			const result: FindUserResult = {
				userCode: record.user_code,
				name: record.name,
				active: record.active,
				userRole: record.user_role,
				friendStatus: record.friend_status
			};

			// Minimum needed visibility level needed to view a piece of data
			const neededVisibility = (record.is_self || isPrivileged)
				? PrivacyFlag.Private
				: record.friend_status === FriendStatus.Friends
					? PrivacyFlag.FriendsOnly
					: PrivacyFlag.Public;

			if (record.email_privacy >= neededVisibility) {
				result.email = record.email;
			}

			if (record.phone_privacy >= neededVisibility) {
				result.phone = record.phone;
			}

			if (record.birthday_privacy >= neededVisibility) {
				result.birthday = record.birthday;
			}

			if (record.location_privacy >= neededVisibility) {
				result.location = record.location;
			}

			if (record.is_self) {
				result.isSelf = true;
			}

			return result;
		});
	}

	catch (error) {
		if (error instanceof HttpError) {
			throw error;
		}

		logger.warn('An unexpected error occured while trying to search for users', { error });

		throw new HttpError(500, 'Unexpected server error');
	}
};
