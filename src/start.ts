
import { createServer } from '@celeri/http-server';
import { requestLogger } from '@celeri/request-logger';



// Server

const server = createServer({
	// 
});

server.server.listen(8080, '0.0.0.0', () => {
	console.log('Server listening on port 8080');
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
