
import { config } from './config';
import { isMaster } from 'cluster';

// Enable configuring the stack trace limit on errors
if (config.logging.stackTraceLimit) {
	Error.stackTraceLimit = config.logging.stackTraceLimit;
}

// Make sure node.js warnings get properly logged
process.on('warning', (warning) => {
	console.warn(warning.stack);
});

// If we are running in single-threaded mode, just start the server
if (! config.cluster.threads || ! isMaster) {
	console.log(`Worker started pid=${process.pid}`);
	require('./worker');
}

// Otherwise, start up the clustered system
else {
	console.log(`Master started pid=${process.pid}`);
	require('./master');
}
