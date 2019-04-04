
import { logger } from '../../../logger';
import { generateSessionKey } from '../../../utils/random-keys';
import { db, TransactionType } from '../../../database';
import { HttpError } from '@celeri/http-error';
import { DeleteSessionQuery } from '../../../database/queries';

const deleteSession = new DeleteSessionQuery();

/**
 * Deletes the given session, rendering the token invalid
 *
 * @param sessionId The session ID to fetch session data for
 */
export const destroySession = async (sessionId: string) : Promise<void> => {
	try {
		await deleteSession.run({ token: sessionId });
	}

	catch (error) {
		if (error instanceof HttpError) {
			throw error;
		}

		logger.warn('An unexpected error occured while trying to delete a session', { error });

		throw new HttpError(500, 'Unexpected server error');
	}
};
