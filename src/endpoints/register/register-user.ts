
import { logger } from '../../logger';
import { hash } from '../../utils/hasher';
import { db, TransactionType } from '../../database';
import { HttpError } from '@celeri/http-error';
import { RegistrationRequest } from './request-payload';
import { LookupUserIdByEmailQuery, CreateUserQuery, CreateCredentialsQuery } from '../../database/queries';

const lookupUserByEmail = new LookupUserIdByEmailQuery();
const createUser = new CreateUserQuery();
const createCredentials = new CreateCredentialsQuery();

/**
 * Attempts to register a new user with the given info
 *
 * @param body The request payload from the `POST /registration` request
 */
export const registerUser = async (body: RegistrationRequest) : Promise<void> => {
	const connection = await db.startTransaction(TransactionType.ReadWrite);

	try {
		const existingUser = await lookupUserByEmail.run({ email: body.email }, connection);

		// If a user with that email address already exists, stop here
		if (existingUser.length) {
			throw new HttpError(409, 'Email address already in use');
		}

		// Hash the password for storage
		const passwordDigest = await hashNewPassword(body.password);

		// Create the new user record
		const createUserResult = await createUser.run({ email: body.email }, connection);

		const credentialsRecord = {
			userId: createUserResult.insertId as number,
			passwordDigest
		}

		// Create the new credentials record
		await createCredentials.run(credentialsRecord, connection);

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
