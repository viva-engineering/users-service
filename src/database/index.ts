
import { usersTable, credentialsTable, sessionsTable } from './tables';
import {
	CreateUserQuery,
	CreateCredentialsQuery,
	LookupUserIdByEmailQuery,
	GetLoginDetailsQuery,
	CreateSessionQuery,
	GetSessionQuery,
	DeleteSessionQuery
} from './queries';

export { db } from './db';
export { TransactionType } from '@viva-eng/database';

export const tables = {
	users: usersTable,
	credentials: credentialsTable,
	sessions: sessionsTable
};

export const queries = {
	createUser: new CreateUserQuery(),
	createCredentials: new CreateCredentialsQuery(),
	lookupUserIdByEmail: new LookupUserIdByEmailQuery(),
	getLoginDetails: new GetLoginDetailsQuery(),
	createSession: new CreateSessionQuery(),
	getSession: new GetSessionQuery(),
	deleteSession: new DeleteSessionQuery()
};
