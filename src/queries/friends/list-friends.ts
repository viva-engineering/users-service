
import { SelectQueryResult } from '@viva-eng/database';
import { MysqlError, format } from 'mysql';
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

const pageSize = 100;

const tables = schemas.users.tables;
const user = tables.users.columns;
const friend = tables.friends.columns;
const priv = tables.userPrivacySettings.columns;
const role = tables.userRoles.columns;

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
	| typeof priv.birthdayPrivacy;

export type ListFriendsRecord
	= Record<UsersColumns, UserSelectList, { user_role: UserRole; }>
	& Record<UserPrivacySettingsColumns, PrivSelectList, { }>;

export interface ListFriendsParams {
	userId: number;
	page: number;
};

/**
 * Query that searches for a user by user defined parameters. Is bound to the searching user to only
 * return results the user should be allowed to see
 */
class ListFriendsQuery extends SelectQuery<ListFriendsParams, ListFriendsRecord> {
	public readonly template = 'list friends';
	protected readonly prepared: string;

	constructor() {
		super();

		this.prepared = `
			select
				user.${user.userCode},
				user.${user.email},
				user.${user.name},
				user.${user.phone},
				user.${user.location},
				user.${user.birthday},
				user.${user.active},
				user.${user.emailValidated},
				priv.${priv.emailPrivacy},
				priv.${priv.phonePrivacy},
				priv.${priv.locationPrivacy},
				priv.${priv.birthdayPrivacy},
				role.${role.description} as user_role
			from (?) friend
			left outer join users user
				on user.id = friend.user_id
			left outer join ${tables.userPrivacySettings} priv
				on priv.${priv.id} = user.${user.privacySettingsId}
			left outer join ${tables.userRoles} role
				on role.${role.id} = user.${user.userRoleId}
			order by friend.user_id asc
			limit ?
			offset ?
		`;
	}

	compile({ userId, page }: ListFriendsParams) : string {
		const friendIds = friendIdsSubQuery.compile({ userId, accepted: 1 });

		return format(this.prepared, [
			friendIds,
			pageSize,
			pageSize * page
		]);
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}
}

export const listFriends = new ListFriendsQuery();
