
import { logger } from '../../../logger';
import { HttpError } from '@celeri/http-error';
import { TransactionType } from '@viva-eng/database';
import { db, Bit, PrivacyFlag, UserRole } from '@viva-eng/viva-database';
import { SearchUserQueryParams } from './middlewares';
import { AuthenticatedUser } from '../../../middlewares/authenticate';
import { searchUser, SearchUserRecord } from '../../../queries/search-user';

const privilegedRoles = new Set([
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
	isFriend?: true;
	isSelf?: true;
}

/**
 * Performs a search for users matching the given criteria
 */
export const findUsers = async (query: SearchUserQueryParams, searchAs: AuthenticatedUser) : Promise<FindUserResult[]> => {
	try {
		const records: SearchUserRecord[] = await searchUser.run({
			name: query.name,
			email: query.email,
			phone: query.phone,
			userCode: query.userCode,
			searchAs: searchAs
		});

		return records.map((record) => {
			const result: FindUserResult = {
				userCode: record.user_code,
				name: record.name,
				active: record.active,
				userRole: record.user_role
			};

			// Minimum needed visibility level needed to view a piece of data
			const neededVisibility = (record.is_self || privilegedRoles.has(searchAs.userRole))
				? PrivacyFlag.Private
				: record.is_friend
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

			if (record.is_friend) {
				result.isFriend = true;
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
