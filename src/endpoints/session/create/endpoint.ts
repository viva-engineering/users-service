
import { server } from '../../../server';
import { HttpError } from '@celeri/http-error';
import { bodyParser } from '@celeri/body-parser';
import { Req, validateBody } from './params';
import { loginUser } from './service';

// Create session endpoint, takes a user's credentials (email / password) and starts
// a new user session
server
	.post<void, Req>('/session')
	.use(bodyParser({ maxSize: '2kb' }))
	.use(validateBody)
	.use(async ({ req, res }) => {
		const result = await loginUser(req.body);
		const payload = JSON.stringify(result);

		res.writeHead(201, { 'content-type': 'application/json' });
		res.end(payload);
	});
