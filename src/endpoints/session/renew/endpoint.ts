
import { server } from '../../../server';
import { HttpError } from '@celeri/http-error';
import { bodyParser } from '@celeri/body-parser';
import { renewSession } from './service';
import { readTokens, ReqWithTokens } from '../../../middlewares/tokens';

// Update session endpoint, renews an existing session by generating a new token with a
// fresh expiration
server
	.put<void, ReqWithTokens>('/session/renew')
	.use(readTokens({ requireSessionToken: true }))
	.use(async ({ req, res }) => {
		const result = await renewSession(req.tokens.session);
		const payload = JSON.stringify(result);

		res.writeHead(201, { 'content-type': 'application/json' });
		res.end(payload);
	});
