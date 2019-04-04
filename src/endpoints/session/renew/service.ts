
import { logger } from '../../../logger';
import { generateSessionKey } from '../../../utils/random-keys';
import { db, queries, TransactionType } from '../../../database';
import { HttpError } from '@celeri/http-error';

const enum ErrorCode {
	InvalidSessionId = 'INVALID_SESSION_ID',
	SessionExpired = 'SESSION_EXPIRED',
	AccountDisabled = 'ACCOUNT_DISABLED'
}

export interface RenewSessionResult {
	token: string;
	needsEmailValidation?: true;
	passwordExpired?: true;
}

/**
 * Attempts to renew an existing session
 *
 * @param sessionId The session ID for the existing session
 */
export const renewSession = async (sessionId: string) : Promise<RenewSessionResult> => {
	const connection = await db.startTransaction(TransactionType.ReadWrite);

	let transactionOpen = true;

	try {
		const session = await queries.getSession.run({ token: sessionId }, connection);

		if (! session) {
			throw new HttpError(401, 'Invalid session token provided', {
				code: ErrorCode.InvalidSessionId
			});
		}

		// If the account has become disabled since the session was started, do not
		// allow them to keep taking action
		if (! session.user_active) {
			await queries.deleteSession.run({ token: sessionId }, connection);
			await db.commitTransaction(connection);

			transactionOpen = false;

			throw new HttpError(401, 'Account is disabled', {
				code: ErrorCode.AccountDisabled
			});
		}

		// If the session is expired, we can delete the session record now to help keep
		// the table clean
		if (session.session_expired) {
			await queries.deleteSession.run({ token: sessionId }, connection);
			await db.commitTransaction(connection);

			transactionOpen = false;

			throw new HttpError(401, 'Session is expired', {
				code: ErrorCode.SessionExpired
			});
		}

		const token = await generateSessionKey();
		const newSession = {
			userId: session.user_id,
			token
		};

		queries.createSession.run(newSession, connection);

		await db.commitTransaction(connection);

		connection.release();

		const result: RenewSessionResult = { token };

		if (! session.email_validated) {
			result.needsEmailValidation = true;
		}

		if (session.password_expired) {
			result.passwordExpired = true;
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

		logger.warn('An unexpected error occured while trying to login', { error });

		throw new HttpError(500, 'Unexpected server error');
	}
};
