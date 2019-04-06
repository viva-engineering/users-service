
import { logger } from '../../../logger';
import { generateSessionKey } from '../../../utils/random-keys';
import { HttpError } from '@celeri/http-error';
import { db } from '@viva-eng/viva-database';
import { TransactionType } from '@viva-eng/database';
import { deleteSession } from '../../../queries';

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
