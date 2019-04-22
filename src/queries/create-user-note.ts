
// import { WriteQueryResult } from '@viva-eng/database';
// import { WriteQuery, schemas, SessionsColumns } from '@viva-eng/viva-database';

// const tables = schemas.users.tables;
// const sess = tables.sessions.columns;

// export interface CreateUserNoteParams {
// 	userId: SessionsColumns[typeof sess.userId];
// 	token: SessionsColumns[typeof sess.id];
// }


// /**
//  * Query that creates a new moderator note about a user
//  */
// class CreateUserNoteQuery extends WriteQuery<CreateUserNoteParams> {
// 	public readonly template = 'create user note';
// 	protected readonly prepared = `
// 		insert into ${tables.sessions}
// 		(
// 			${sess.id},
// 			${sess.userId},
// 			${sess.expiration}
// 		)
// 		values
// 		(?, ?, adddate(now(), interval 30 minute))
// 	`;

// 	compile({ userId, token }: CreateUserNoteParams) : string {
// 		return format(this.prepared, [ token, userId ]);
// 	}

// 	isRetryable(error: MysqlError) : boolean {
// 		return false;
// 	}
// }

// export const createUserNote = new CreateUserNoteQuery();
