
import { config } from './config';
import { logger } from './logger';
import { initCluster, shutdown } from '@viva-eng/cluster';
import { resolve } from 'path';

// Enable configuring the stack trace limit on errors
if (config.logging.stackTraceLimit) {
	Error.stackTraceLimit = config.logging.stackTraceLimit;
}

// Make sure node.js warnings get properly logged
process.on('warning', (warning) => {
	logger.warn(warning.stack);
});

// Catch uncaught errors so we can shutdown gracefully
process.on('uncaughtException', (error) => {
	logger.error('Uncaught exception', { error });
	shutdown(1);
});

// Catch unhandled promise rejections so we can shutdown gracefully
process.on('unhandledRejection', (error) => {
	logger.error('Unhandled rejection', { error });
	shutdown(1);
});

initCluster({
	threads: config.cluster.threads,
	heapSize: config.cluster.heapSize,
	extraCpus: config.cluster.extraCpus,
	log: logger.verbose.bind(logger),
	worker: resolve(__dirname, 'server.js')
});
