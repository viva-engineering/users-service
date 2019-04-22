
import { SelectQueryResult } from '@viva-eng/database';
import { MysqlError, format } from 'mysql';
import { AuthenticatedUser } from '../middlewares/authenticate';
import {
	SelectQuery,
	schemas,
	Bit,
	PrivacyFlag,
	Record,
	UsersColumns,
	UserRolesColumns,
	UserPrivacySettingsColumns,
	UserRole
} from '@viva-eng/viva-database';

const tables = schemas.users.tables;
const user = tables.users.columns;
const friend = tables.friends.columns;
const priv = tables.userPrivacySettings.columns;
const role = tables.userRoles.columns;

const privilegedRoles = new Set([
	UserRole.Admin,
	UserRole.SuperModerator,
	UserRole.Moderator
]);

type UserSelectList
	= typeof user.userCode
	| typeof user.email
	| typeof user.name
	| typeof user.phone
	| typeof user.location
	| typeof user.birthday
	| typeof user.active
	| typeof user.emailValidated;

type PrivSelectList
	= typeof priv.emailPrivacy
	| typeof priv.phonePrivacy
	| typeof priv.locationPrivacy
	| typeof priv.birthdayPrivacy
	| typeof priv.defaultImagePrivacy
	| typeof priv.defaultPostPrivacy
	| typeof priv.discoverableByEmail
	| typeof priv.discoverableByName
	| typeof priv.discoverableByPhone;

export type GetUserProfileRecord
	= Record<UsersColumns, UserSelectList, {
		is_self: boolean;
		is_friend: boolean;
		user_role: UserRole;
	}>
	& Record<UserPrivacySettingsColumns, PrivSelectList, { }>;

export interface GetUserProfileParams {
	userCode: string;
	searchAs: AuthenticatedUser;
}

/**
 * Query that searches for a user by friend code. Is bound to the searching user to only
 * return results the user should be allowed to see
 */
class GetUserProfileQuery extends SelectQuery<GetUserProfileParams, GetUserProfileRecord> {
	public readonly template = 'get user profile';
	protected readonly prepared = `
		select
			user.${user.userCode} as user_code,
			user.${user.email} as email,
			priv.${priv.emailPrivacy} as email_privacy,
			user.${user.name} as name,
			user.${user.phone} as phone,
			priv.${priv.phonePrivacy} as phone_privacy,
			user.${user.location} as location,
			priv.${priv.locationPrivacy} as location_privacy,
			user.${user.birthday} as birthday,
			priv.${priv.birthdayPrivacy} as birthday_privacy,
			role.${role.description} as user_role,
			(user.${user.id} = ?) as is_self,
			(friend.${friend.userA} is not null and friend.${friend.userB} is not null) as is_friend,
			priv.${priv.defaultPostPrivacy} as default_post_privacy,
			priv.${priv.defaultImagePrivacy} as default_image_privacy,
			priv.${priv.discoverableByEmail} as discoverable_by_email,
			priv.${priv.discoverableByName} as discoverable_by_name,
			priv.${priv.discoverableByPhone} as discoverable_by_phone
		from ${tables.users} user
		left outer join ${tables.userPrivacySettings} priv
			on priv.${priv.id} = user.${user.privacySettingsId}
		left outer join ${tables.friends} friend
			on (friend.${friend.userA} = user.${user.id} and friend.${friend.userB} = ?)
			or (friend.${friend.userB} = user.${user.id} and friend.${friend.userA} = ?)
		left outer join ${tables.userRoles} role
			on role.${role.id} = user.${user.userRoleId}
		where user.${user.userCode} = ?
	`;

	compile({ userCode, searchAs }: GetUserProfileParams) : string {
		return format(this.prepared, [
			// Check for self
			searchAs.userId,
			// Join on friends table to check if friends
			searchAs.userId,
			searchAs.userId,
			// The user being searched for
			userCode
		]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}
}

export const getUserProfile = new GetUserProfileQuery();
