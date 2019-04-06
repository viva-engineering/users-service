
import { server } from '../../../server';
import { HttpError } from '@celeri/http-error';
import { bodyParser } from '@celeri/body-parser';
import { validatePostPayload, LoginRequest } from './validate';
import { loginUser } from './service';

// Create session endpoint, takes a user's credentials (email / password) and starts
// a new user session
server
	.post('/session')
	.use(bodyParser({ maxSize: '2kb' }))
	.use(validatePostPayload)
	.use(async ({ req, res }) => {
		const body = req.body as LoginRequest;
		const result = await loginUser(req.body);
		const payload = JSON.stringify(result);

		res.writeHead(200, { 'content-type': 'application/json' });
		res.end(payload);
	});
