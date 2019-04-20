
import { logger } from '../../../logger';
import { generateSessionKey } from '../../../utils/random-keys';
import { HttpError } from '@celeri/http-error';
import { db } from '@viva-eng/viva-database';
import { getSession, deleteSession, createSession } from '../../../queries';

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
	const sessionRecords = await getSession.run({ token: sessionId });
	const session = sessionRecords[0];

	if (! session) {
		throw new HttpError(401, 'Invalid session token provided', {
			code: ErrorCode.InvalidSessionId
		});
	}

	// If the account has become disabled since the session was started, do not
	// allow them to keep taking action
	if (! session.active) {
		await deleteSession.run({ token: sessionId });

		throw new HttpError(401, 'Account is disabled', {
			code: ErrorCode.AccountDisabled
		});
	}

	// If the session is expired, we can delete the session record now to help keep
	// the table clean
	if (session.session_expired) {
		await deleteSession.run({ token: sessionId });

		throw new HttpError(401, 'Session is expired', {
			code: ErrorCode.SessionExpired
		});
	}

	const token = await generateSessionKey();

	createSession.run({
		userId: session.id,
		token
	});

	const result: RenewSessionResult = { token };

	if (! session.email_validated) {
		result.needsEmailValidation = true;
	}

	if (session.password_expired) {
		result.passwordExpired = true;
	}

	return result;
};
