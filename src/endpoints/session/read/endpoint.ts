
import { server } from '../../../server';
import { HttpError } from '@celeri/http-error';
import { bodyParser } from '@celeri/body-parser';
import { readTokens } from '../../../middlewares/tokens';
import { fetchSession } from './service';


// Get session endpoint, takes an active session token and returns basic user / session
// metadata
server
	.get('/session')
	.use(readTokens({ requireSessionToken: true }))
	.use(async ({ req, res }) => {
		const result = await fetchSession(req.tokens.session);
		const payload = JSON.stringify(result);

		res.writeHead(200, { 'content-type': 'application/json' });
		res.end(payload);
	});
