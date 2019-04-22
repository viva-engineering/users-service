
// import { WriteQueryResult } from '@viva-eng/database';
// import { WriteQuery, tables, Bit } from '@viva-eng/viva-database';
// import { MysqlError, format } from 'mysql';

// export interface OverrideProfileParams {
// 	userCode: string;
// 	name?: string;
// 	active?: Bit;
// 	lockActive?: Bit;
// 	containsExplicitContent?: Bit;
// 	lockContainsExplicitContent?: Bit;
// 	explicitContentVisible?: Bit;
// 	lockExplicitContentVisible?: Bit;
// }

// const user = tables.users.columns;

// /**
//  * Query that overrides attributes on a profile with admin permissions
//  */
// class OverrideProfileQuery extends WriteQuery<OverrideProfileParams> {
// 	public readonly template = `update ${tables.users} set ... where ${user.userCode} = ?`;

// 	constructor() {
// 		super();
// 	}

// 	compile(params: OverrideProfileParams) : string {
// 		const fields = [ ];

// 		if (params.name) {
// 			fields.push(format(`${user} = ?`, [ params.name ]));
// 		}

// 		if (params.active) {
// 			fields.push(format(`${user.active} = ?`, [ params.active ]));
// 		}

// 		if (params.lockActive) {
// 			// fields.push(format(`${user.} = ?`, [ params.lockActive ]));
// 		}

// 		if (params.containsExplicitContent) {
// 			fields.push(format(`${user.containsExplicitContent} = ?`, [ params.containsExplicitContent ]));
// 		}

// 		if (params.lockContainsExplicitContent) {
// 			// fields.push(format(`${user.} = ?`, [ params.lockContainsExplicitContent ]));
// 		}

// 		if (params.name) {
// 			fields.push(format(`${user} = ?`, [ params.name ]));
// 		}

// 		if (params.lockExplicitContentVisible) {
// 			// fields.push(format(`${user.} = ?`, [ params.lockExplicitContentVisible ]));
// 		}

// 		if (! fields.length) {
// 			throw new Error('Expected at least one field to be set');
// 		}

// 		return format(`update ${tables.users} set ${fields.join(', ')} where ${user.userCode} = ?`, [ params.userCode ]);
// 	}

// 	isRetryable(error: MysqlError) : boolean {
// 		return false;
// 	}
// }

// export const overrideProfile = new OverrideProfileQuery();
