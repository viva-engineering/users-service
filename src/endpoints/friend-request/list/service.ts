
import { logger } from '../../../logger';
import { AuthenticatedUser } from '../../../middlewares/authenticate';
import { listFriendRequests } from '../../../queries';
import { PrivacyFlag, UserRole } from '@viva-eng/viva-database';

const privilegedRoles = new Set([
	UserRole.Admin,
	UserRole.Moderator,
	UserRole.SuperModerator
]);

export interface FriendRequest {
	userCode: string;
	email: string;
	name: string;
	phone: string;
	location: string;
	birthday: string;
	emailPrivacy: PrivacyFlag;
	phonePrivacy: PrivacyFlag;
	locationPrivacy: PrivacyFlag;
	birthdayPrivacy: PrivacyFlag;
	userRole: UserRole;
}

/**
 * Returns a page of results from the user's open friend requests
 *
 * @param user The authenticated user
 * @param page The page of records to fetch (0-indexed)
 */
export const getFriendRequests = async (user: AuthenticatedUser, page: number) : Promise<FriendRequest[]> => {
	const records = await listFriendRequests.run({ userId: user.userId, page });
	const neededPermissions = privilegedRoles.has(user.userRole)
		? PrivacyFlag.Private
		: PrivacyFlag.Public;

	return records.map((record) => {
		const request = { } as FriendRequest;

		request.userCode = record.user_code,
		request.name = record.name;
		request.userRole = record.user_role;

		if (neededPermissions < record.email_privacy) {
			request.email = record.email;
		}

		if (neededPermissions < record.phone_privacy) {
			request.phone = record.phone;
		}

		if (neededPermissions < record.location_privacy) {
			request.location = record.location;
		}

		if (neededPermissions < record.birthday_privacy) {
			request.birthday = record.birthday;
		}

		return request;
	});
};
