
import { cpus } from 'os';
import * as cluster from 'cluster';
import { config } from './config';

// Figure out the max number of workers we're allowed to spawn at once
const maxWorkers: number = (() => {
	if (config.cluster.threads !== 'auto') {
		return config.cluster.threads;
	}

	const availableCpus = cpus().length;

	return config.cluster.extraCpus
		? Math.max(1, availableCpus - config.cluster.extraCpus)
		: availableCpus;
})();

// If the worker heap size was configured explicitly, set that up now
if (config.cluster.heapSize) {
	cluster.setupMaster({
		execArgv: process.execArgv.concat([ `--max_old_space_size=${config.cluster.heapSize}` ])
	})
}

// Spin up the initial batch of workers
for (let i = 0; i < maxWorkers; i++) {
	cluster.fork();
}

let respawnBackoff: number = 0;

/**
 * Respawns a single dead worker
 */
const respawnWorker = () => {
	const backoff = respawnBackoff++;
	const delay = 1000 * 2 ** (backoff + Math.random());

	const spawn = () => {
		setTimeout(() => respawnBackoff--, 1000);
		cluster.fork();
	};

	setTimeout(spawn, delay);
};

/**
 * Runs when a worker crashes. If all workers have crashed, it will shutdown the server. Otherwise, it
 * will attempt to respawn the crashed worker.
 */
const handleWorkerDeath = (worker: cluster.Worker, code: number, signal: string) => {
	if (Object.keys(cluster.workers).length === 0) {
		process.exit(1);

		return;
	}

	respawnWorker();
};

// When a worker dies, queue up the handler to take care of it
cluster.on('exit', (worker, code, signal) => {
	setTimeout(() => handleWorkerDeath(worker, code, signal), 100);
});
