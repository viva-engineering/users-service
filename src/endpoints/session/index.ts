
import { server } from '../../server';
import { db } from '../../database';
import { bodyParser } from '@celeri/body-parser';
import { validatePostPayload, LoginRequest } from './request-payload/post';
import { loginUser } from './login-user';
import { fetchSession } from './fetch-session';
import { HttpError } from '@celeri/http-error';

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


// Get session endpoint, takes an active session token and returns basic user / session
// metadata
server
	.get('/session')
	.use(async ({ req, res }) => {
		const token = req.headers['x-user-token'];

		if (Array.isArray(token)) {
			throw new HttpError(400, 'Cannot provide more than one token');
		}

		const result = await fetchSession(token);
		const payload = JSON.stringify(result);

		res.writeHead(200, { 'content-type': 'application/json' });
		res.end(result);
	});


// Update session endpoint, renews an existing session by generating a new token with a
// fresh expiration
server
	.put('/session/renew')
	.use(async ({ req, res }) => {
		const token = req.headers['x-user-token'];

		// TODO: Build out endpoint to renew an existing session by generating a new token

		res.writeHead(200, { 'content-type': 'application/json' });
		res.end('{}');
	});


// Delete session endpoint, deletes an existing session, essentially loging out the user
server
	.delete('/session')
	.use(async ({ req, res }) => {
		const token = req.headers['x-user-token'];

		// TODO: Build out endpoint to delete a session (log out)

		res.writeHead(200, { 'content-type': 'application/json' });
		res.end('{}');
	});
