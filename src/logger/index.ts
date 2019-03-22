
import { config } from '../config';
import { isMaster } from 'cluster';
import { PrettyFormat } from './pretty';
import {
	Logger,
	LoggerConfig,
	JsonFormat,
	StdoutOutput,
	ClusterOutput,
	ClusterOutputReceiver
} from '@viva-eng/logger';

let _logger: Logger;

const format = config.logging.output === 'json' ? JsonFormat : PrettyFormat;
const thread = (isMaster ? 'master' : 'worker') + `/${process.pid}`;
const meta = config.logging.output === 'json' ? { thread } : { };

const loggerConfig: LoggerConfig = {
	format,
	output: null,
	level: config.logging.logLevel,
	colors: config.logging.colors,
	thread,
	meta
};

if (isMaster) {
	loggerConfig.output = new StdoutOutput();
	_logger = new Logger(loggerConfig);

	const clusterOutputReceiver = new ClusterOutputReceiver(_logger);
}

else {
	loggerConfig.output = new ClusterOutput();
	_logger = new Logger(loggerConfig);
}

export const logger = _logger;
