
import { logger } from '../logger';
import { config } from '../config';
import { DatabasePool } from '@viva-eng/database';
import { addOnShutdown } from '@viva-eng/cluster';
import { PoolConnection } from 'mysql';

export { TransactionType } from '@viva-eng/database';

export const db = new DatabasePool({
	master: config.mysql.master,
	replica: config.mysql.replica,
	logger
});

addOnShutdown(async () => {
	logger.verbose('Closing database pool');

	await db.destroy();
	
	logger.verbose('Database pool closed');
});
