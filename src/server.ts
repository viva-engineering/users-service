
import { createServer } from '@celeri/http-server';
import { requestLogger } from '@celeri/request-logger';
import { config } from './config';



// Server

const server = createServer({
	// 
});

server.server.listen(config.http.port, config.http.address, () => {
	console.log(`Server listening on port ${config.http.port}`);
});



// Logger

const logger = requestLogger({
	log: (message: string) => console.log(message),
	format: `:iso-time request: proto=:proto method=:method path=:path status=:status-code duration=:duration`
});

server.use(logger);



// Router

const router = server.router({
	notFound: ({ req, res }) => {
		res.writeHead(404, { 'content-type': 'application/json' });
		res.end('{"error":"Not Found"}');
	}
});

server.use(router);



// Endpoints

server
	.get('/')
	.use(({ req, res }) => {
		res.writeHead(200, { 'content-type': 'application/json' });
		res.end('{"message":"hello"}');
	});
