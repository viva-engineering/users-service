
import { hostname } from 'os';
import { server } from '../server';

interface Healthcheck {
	status: 'available' | 'dependency failure',
	hostname: string
}

interface Dependency {
	available: boolean,
	[key: string]: any
}

interface FullHealthcheck extends Healthcheck {
	dependencies: {
		[name: string]: Dependency
	}
}

server
	.get('/healthcheck')
	.use(({ req, res }) => {
		const payload: Healthcheck = {
			status: 'available',
			hostname: hostname()
		};

		res.writeHead(200, { 'content-type': 'application/json' });
		res.end(JSON.stringify(payload));
	});

server
	.get('/healthcheck/full')
	.use(async ({ req, res }) => {
		const dependencies: Dependency[] = [ ];

		const available = dependencies.every((dependency) => dependency.available);
		const statusCode = available ? 200 : 503;

		const payload: FullHealthcheck = {
			status: available ? 'available' : 'dependency failure',
			hostname: hostname(),
			dependencies: { }
		};

		res.writeHead(statusCode, { 'content-type': 'application/json' });
		res.end(JSON.stringify(payload));
	});
