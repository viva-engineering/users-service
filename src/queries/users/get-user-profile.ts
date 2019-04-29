
import { SelectQueryResult } from '@viva-eng/database';
import { MysqlError, format } from 'mysql';
import { AuthenticatedUser } from '../../middlewares/authenticate';
import { friendStatusSubQuery, FriendStatus } from './friend-status';
import { joinFriendSubQuery } from './join-friends';
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

const { users, friends, userPrivacySettings, userRoles } = schemas.users.tables;

const user = users.columns;
const friend = friends.columns;
const priv = userPrivacySettings.columns;
const role = userRoles.columns;

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
		friend_status: FriendStatus;
		user_role: UserRole;
	}>
	& Record<UserPrivacySettingsColumns, PrivSelectList, { }>;

export interface GetUserProfileParams {
	userCode: string;
	searchAsUserId: number;
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
		  (?) as friend_status,
		  priv.${priv.defaultPostPrivacy} as default_post_privacy,
		  priv.${priv.defaultImagePrivacy} as default_image_privacy,
		  priv.${priv.discoverableByEmail} as discoverable_by_email,
		  priv.${priv.discoverableByName} as discoverable_by_name,
		  priv.${priv.discoverableByPhone} as discoverable_by_phone
		from ${users} user
		left outer join ${userPrivacySettings} priv
		  on priv.${priv.id} = user.${user.privacySettingsId}
		?
		left outer join ${userRoles} role
		  on role.${role.id} = user.${user.userRoleId}
		where user.${user.userCode} = ?
	`;

	compile({ userCode, searchAsUserId }: GetUserProfileParams) : string {
		const friendStatus = friendStatusSubQuery.compile({ userId: searchAsUserId });
		const joinFriends = joinFriendSubQuery.compile({ userId: searchAsUserId });

		return format(this.prepared, [
			// Check for self
			searchAsUserId,
			// Used to determine friends status
			friendStatus,
			joinFriends,
			// The user being searched for
			userCode
		]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}
}

export const getUserProfile = new GetUserProfileQuery();
