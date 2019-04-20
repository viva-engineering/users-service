
import { logger } from '../../../logger';
import { generateSessionKey } from '../../../utils/random-keys';
import { HttpError } from '@celeri/http-error';
import { db } from '@viva-eng/viva-database';
import { deleteSession } from '../../../queries';

/**
 * Deletes the given session, rendering the token invalid
 *
 * @param sessionId The session ID to fetch session data for
 */
export const destroySession = async (sessionId: string) : Promise<void> => {
	await deleteSession.run({ token: sessionId });
};
