
import 'colors';
import { inspect } from 'util';
import { LoggerConfig, Format } from '@viva-eng/logger';

interface PrettyFormatConfig extends LoggerConfig {
	colors: boolean,
	thread: string
}

const coloredLevels = {
	error: 'error'.red,
	warn: 'warn'.yellow,
	info: 'info'.green,
	verbose: 'verbose'.cyan,
	debug: 'debug'.blue,
	silly: 'silly'.magenta
};

export class PrettyFormat implements Format {
	protected readonly inspectOptions: object;
	protected readonly seperator: string;

	constructor(protected readonly config: PrettyFormatConfig) {
		this.inspectOptions = {
			showHidden: false,
			depth: 1,
			colors: this.config.colors,
			compact: true
		};

		this.seperator = '=';
	}

	format(level: string, message: string, meta?: object) : string {
		const timestamp = `[${(new Date).toISOString()}]`;
		const metaString = this.formatMeta(meta);
		const thread = `(${this.config.thread})`;

		if (this.config.colors) {
			return `${timestamp.gray} ${coloredLevels[level]}: ${message} ${metaString} ${thread.grey}`;
		}

		return `${timestamp} ${level}: ${message} ${metaString} ${thread.grey}`;
	}

	formatMeta(meta?: object) : string {
		if (! meta) {
			return '';
		}

		const properties: string[] = [ ];

		Object.keys(meta).forEach((key) => {
			const value = meta[key];

			properties.push(`${key}${this.seperator}${inspect(value, this.inspectOptions)}`);
		});

		return properties.join(' ');
	}
}
