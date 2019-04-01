
import { hash } from '../../hasher';
import { logger } from '../../logger';
import { LookupUserByEmailQuery } from '../../queries/lookup-user';
import { RegistrationRequest } from './request-payload';
import { HttpError } from '@celeri/http-error';

const lookupUserByEmail = new LookupUserByEmailQuery();

/**
 * Checks if a user with the given email address already exists
 *
 * @param email The email address to look for
 */
const userAlreadyExists = async (email: string) : Promise<boolean> => {
	const records = await lookupUserByEmail.run({ email });

	return !! records.length;
};

/**
 * Attempts to register a new user with the given info
 *
 * @param body The request payload from the `POST /registration` request
 */
export const registerUser = async (body: RegistrationRequest) : Promise<void> => {
	if (await userAlreadyExists(body.email)) {
		throw new HttpError(409, 'Email address already in use');
	}

	const passwordDigest = await hashNewPassword(body.password);

	logger.info('Everything looks good, ready to insert new records', {
		email: body.email,
		password: body.password,
		digest: passwordDigest
	});
};

/**
 * Hashes a new user's password for storage.
 * Throws a generic HttpError<500> in the case of any error during hashing.
 *
 * @param password The new password to hash
 */
const hashNewPassword = async (password: string) : Promise<string> => {
	try {
		return await hash(password);
	}

	catch (error) {
		logger.warn('Failed to hash password', { error });

		throw new HttpError(500, 'Unexpected server error');
	}
};
