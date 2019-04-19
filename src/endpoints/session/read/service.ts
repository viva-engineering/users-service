
import { logger } from '../../../logger';
import { generateSessionKey } from '../../../utils/random-keys';
import { HttpError } from '@celeri/http-error';
import { db } from '@viva-eng/viva-database';
import { TransactionType } from '@viva-eng/database';
import { getSession, deleteSession, createSession } from '../../../queries';

const enum ErrorCode {
	InvalidSessionId = 'INVALID_SESSION_ID',
	SessionExpired = 'SESSION_EXPIRED',
	AccountDisabled = 'ACCOUNT_DISABLED'
}

export interface SessionResult {
	userId: number;
	userCode: string;
	email: string;
	name: string;
	needsEmailValidation?: true;
	passwordExpired?: true;
	isAdmin?: true;
	isModerator?: true;
}

/**
 * Attempts to register a new user with the given info
 *
 * @param sessionId The session ID to fetch session data for
 */
export const fetchSession = async (sessionId: string) : Promise<SessionResult> => {
	const connection = await db.startTransaction(TransactionType.ReadWrite);

	let transactionOpen = true;

	try {
		const session = (await getSession.run({ token: sessionId }, connection))[0];

		if (! session) {
			throw new HttpError(401, 'Invalid session token provided', {
				code: ErrorCode.InvalidSessionId
			});
		}

		// If the account has become disabled since the session was started, do not
		// allow them to keep taking action
		if (! session.user_active) {
			await deleteSession.run({ token: sessionId }, connection);
			await db.commitTransaction(connection);

			transactionOpen = false;

			throw new HttpError(401, 'Account is disabled', {
				code: ErrorCode.AccountDisabled
			});
		}

		// If the session is expired, we can delete the session record now to help keep
		// the table clean
		if (session.session_expired) {
			await deleteSession.run({ token: sessionId }, connection);
			await db.commitTransaction(connection);

			transactionOpen = false;

			throw new HttpError(401, 'Session is expired', {
				code: ErrorCode.SessionExpired
			});
		}

		await db.commitTransaction(connection);

		connection.release();

		const result: SessionResult = {
			userId: session.user_id,
			userCode: session.user_code,
			email: session.email,
			name: session.name
		};

		if (! session.email_validated) {
			result.needsEmailValidation = true;
		}

		if (session.password_expired) {
			result.passwordExpired = true;
		}

		if (session.is_admin) {
			result.isAdmin = true;
		}

		if (session.is_moderator) {
			result.isModerator = true;
		}

		return result;
	}

	catch (error) {
		if (transactionOpen) {
			await db.rollbackTransaction(connection);
		}

		connection.release();

		if (error instanceof HttpError) {
			throw error;
		}

		logger.warn('An unexpected error occured while trying to lookup a session', { error });

		throw new HttpError(500, 'Unexpected server error');
	}
};
