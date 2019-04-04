
import { logger } from '../../../logger';
import { hash } from '../../../utils/hasher';
import { db, queries, TransactionType } from '../../../database';
import { HttpError } from '@celeri/http-error';
import { RegistrationRequest } from './validate';

const enum ErrorCode {
	EmailAlreadyInUse = 'EMAIL_ALREADY_IN_USE'
}

/**
 * Attempts to register a new user with the given info
 *
 * @param body The request payload from the `POST /registration` request
 */
export const registerUser = async (body: RegistrationRequest) : Promise<void> => {
	const connection = await db.startTransaction(TransactionType.ReadWrite);

	try {
		const existingUser = await queries.lookupUserIdByEmail.run({ email: body.email }, connection);

		// If a user with that email address already exists, stop here
		if (existingUser) {
			throw new HttpError(409, 'Email address already in use', {
				code: ErrorCode.EmailAlreadyInUse
			});
		}

		// Hash the password for storage
		const passwordDigest = await hashNewPassword(body.password);

		// Create the new user record
		const createUserResult = await queries.createUser.run({ email: body.email }, connection);

		const credentialsRecord = {
			userId: createUserResult.insertId as number,
			passwordDigest
		}

		// Create the new credentials record
		await queries.createCredentials.run(credentialsRecord, connection);

		await db.commitTransaction(connection);

		connection.release();
	}

	catch (error) {
		await db.rollbackTransaction(connection);

		connection.release();

		throw error;
	}
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
