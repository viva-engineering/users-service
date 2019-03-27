
import { createServer, Request, Response } from '@celeri/http-server';
import { requestLogger } from '@celeri/request-logger';
import { config } from './config';
import { logger } from './logger';
import { loadEndpoints } from './endpoints';
import { addOnShutdown } from '@viva-eng/cluster';



// Server

export const server = createServer({
	// 
});

server.server.listen(config.http.port, config.http.address, () => {
	logger.info('HTTP server is listening', {
		port: config.http.port,
		address: config.http.address
	});
});



// Logger

const loggerMiddleware = requestLogger({
	log: (message: string, req: Request, res: Response, duration: string, finished: boolean) => {
		logger.info('Incomming request', {
			method: req.method,
			path: req.pathname,
			status: res.statusCode,
			duration
		});
	}
});

server.use(loggerMiddleware);



// Router

const routerMiddleware = server.router({
	notFound: ({ req, res }) => {
		res.writeHead(404, { 'content-type': 'application/json' });
		res.end('{"error":"Not Found"}');
	}
});

server.use(routerMiddleware);



// Endpoints
loadEndpoints();
