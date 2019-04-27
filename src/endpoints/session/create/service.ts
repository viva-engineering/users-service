
import { logger } from '../../../logger';
import { verify } from '../../../utils/hasher';
import { generateSessionKey } from '../../../utils/random-keys';
import { HttpError } from '@celeri/http-error';
import { Body } from './params';
import { db } from '@viva-eng/viva-database';
import { getLoginDetails, createSession } from '../../../queries';

const enum ErrorCode {
	InvalidCredentials = 'INVALID_CREDENTIALS',
	AccountDisabled = 'ACCOUNT_DISABLED',
	CredentialsDisabled = 'CREDENTIALS_DISABLED'
}

export interface LoginResult {
	token: string;
	needsEmailValidation?: true;
	passwordExpired?: true;
}

/**
 * Attempts to login a user with their credentials, and create a new session
 *
 * @param body The request payload from the `POST /session` request
 */
export const loginUser = async (body: Body) : Promise<LoginResult> => {
	const loginDetails = (await getLoginDetails.run({ email: body.email }))[0];

	if (! loginDetails) {
		throw new HttpError(401, 'Invalid credentials', {
			code: ErrorCode.InvalidCredentials
		});
	}

	await verifyPassword(loginDetails.password_digest, body.password);

	if (! loginDetails.active) {
		throw new HttpError(401, 'Account is disabled', {
			code: ErrorCode.AccountDisabled
		});
	}

	if (! loginDetails.creds_active) {
		throw new HttpError(401, 'Account credentials are disabled', {
			code: ErrorCode.CredentialsDisabled
		});
	}

	const token = await generateSessionKey();
	const session = {
		userId: loginDetails.id,
		token
	};

	createSession.run(session);

	const result: LoginResult = { token };

	if (! loginDetails.email_validated) {
		result.needsEmailValidation = true;
	}

	if (loginDetails.password_expired) {
		result.passwordExpired = true;
	}

	return result;
};

/**
 * Hashes a new user's password for storage.
 * Throws a generic HttpError<500> in the case of any error during hashing.
 *
 * @param password The new password to hash
 */
const verifyPassword = async (digest: string, password: string) : Promise<void> => {
	try {
		const isValid = await verify(digest, password);

		if (! isValid) {
			throw new HttpError(401, 'Invalid credentials', {
				code: ErrorCode.InvalidCredentials
			});
		}
	}

	catch (error) {
		if (error instanceof HttpError) {
			throw error;
		}

		logger.warn('Failed to hash password', { error });

		throw new HttpError(500, 'Unexpected server error');
	}
};
