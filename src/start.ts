
import { config } from './config';
import { logger } from './logger';
import { initCluster } from '@viva-eng/cluster';
import { resolve } from 'path';

// Enable configuring the stack trace limit on errors
if (config.logging.stackTraceLimit) {
	Error.stackTraceLimit = config.logging.stackTraceLimit;
}

// Make sure node.js warnings get properly logged
process.on('warning', (warning) => {
	logger.warn(warning.stack);
});

initCluster({
	threads: config.cluster.threads,
	heapSize: config.cluster.heapSize,
	extraCpus: config.cluster.extraCpus,
	log: logger.verbose.bind(logger),
	worker: resolve(__dirname, 'server.js')
});
