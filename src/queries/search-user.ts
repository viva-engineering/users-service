
import { SelectQueryResult } from '@viva-eng/database';
import { MysqlError, format } from 'mysql';
import { AuthenticatedUser } from '../middlewares/authenticate';
import {
	SelectQuery,
	schemas,
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
	| typeof priv.birthdayPrivacy;

export type SearchUserRecord
	= Record<UsersColumns, UserSelectList, {
		is_self: boolean;
		is_friend: boolean;
		user_role: UserRole;
	}>
	& Record<UserPrivacySettingsColumns, PrivSelectList, { }>;

export interface SearchUserParams {
	searchAs: AuthenticatedUser;
	name?: string;
	email?: string;
	phone?: string;
	userCode?: string;
};

interface QueryFragments {
	findByName: string;
	findByEmail: string;
	findByPhone: string;
	findByUserCode: string;
}

interface PreparedQueryData {
	template: string;
	privileged: QueryFragments;
	user: QueryFragments;
}

/**
 * Query that searches for a user by user defined parameters. Is bound to the searching user to only
 * return results the user should be allowed to see
 */
class SearchUserQuery extends SelectQuery<SearchUserParams, SearchUserRecord> {
	public readonly template = 'search users';
	protected readonly prepared: PreparedQueryData;

	constructor() {
		super();

		this.prepared = { } as PreparedQueryData;

		this.prepared.template= `
			select
				user.${user.userCode},
				user.${user.active},
				user.${user.email},
				priv.${priv.emailPrivacy},
				user.${user.name},
				user.${user.phone},
				priv.${priv.phonePrivacy},
				user.${user.location},
				priv.${priv.locationPrivacy},
				user.${user.birthday},
				priv.${priv.birthdayPrivacy},
				role.${role.description} as user_role,
				(user.${user.id} = ?) as is_self,
				(friend.${friend.userA} is not null and friend.${friend.userB} is not null) as is_friend
			from ${tables.users} user
			left outer join ${tables.userPrivacySettings} priv
				on priv.${priv.id} = user.${user.privacySettingsId}
			left outer join ${tables.friends} friend
				on (friend.${friend.userA} = user.${user.id} and friend.${friend.userB} = ?)
				or (friend.${friend.userB} = user.${user.id} and friend.${friend.userA} = ?)
			left outer join ${tables.userRoles} role
				on role.${role.id} = user.${user.userRoleId}
		`;

		this.prepared.user = {
			findByName: `where user.${user.name} like ? and priv.${priv.discoverableByName} = 1 limit 100`,
			findByEmail: `where user.${user.email} = ? and priv.${priv.discoverableByEmail} = 1`,
			findByPhone: `where user.${user.phone} = ? and priv.${priv.discoverableByPhone} = 1`,
			findByUserCode: `where user.${user.userCode} = ?`
		};

		this.prepared.privileged = {
			findByName: `where user.${user.name} like ? limit 100`,
			findByEmail: `where user.${user.email} = ?`,
			findByPhone: `where user.${user.phone} = ?`,
			findByUserCode: `where user.${user.userCode} = ?`
		};
	}

	private compileFindByName(name: string, isPrivileged: boolean) : string {
		const fragment = isPrivileged
			? this.prepared.privileged.findByName
			: this.prepared.user.findByName;

		return format(fragment, [ `%${name}%` ]);
	}

	private compileFindByEmail(email: string, isPrivileged: boolean) : string {
		const fragment = isPrivileged
			? this.prepared.privileged.findByEmail
			: this.prepared.user.findByEmail;

		return format(fragment, [ email ]);
	}

	private compileFindByPhone(phone: string, isPrivileged: boolean) : string {
		const fragment = isPrivileged
			? this.prepared.privileged.findByPhone
			: this.prepared.user.findByPhone;

		return format(fragment, [ phone ]);
	}

	private compileFindByUserCode(userCode: string, isPrivileged: boolean) : string {
		const fragment = isPrivileged
			? this.prepared.privileged.findByUserCode
			: this.prepared.user.findByUserCode;

		return format(fragment, [ userCode ]);
	}

	compile({ searchAs, name, email, phone, userCode }: SearchUserParams) : string {
		const isPrivileged = privilegedRoles.has(searchAs.userRole);
		const template = format(this.prepared.template, [
			// Used in the check for self
			searchAs.userId,
			// Used in the check for friends
			searchAs.userId,
			searchAs.userId
		]);

		if (name) {
			return `${template} ${this.compileFindByName(name, isPrivileged)}`;
		}

		if (email) {
			return `${template} ${this.compileFindByEmail(email, isPrivileged)}`;
		}

		if (phone) {
			return `${template} ${this.compileFindByPhone(phone, isPrivileged)}`;
		}

		if (userCode) {
			return `${template} ${this.compileFindByUserCode(userCode, isPrivileged)}`;
		}
	}

	isRetryable(error: MysqlError) : boolean {
		return false;
	}
}

export const searchUser = new SearchUserQuery();
