
import { server } from '../../../server';
import { HttpError } from '@celeri/http-error';
import { destroySession } from './service';
import { readTokens, ReqWithTokens } from '../../../middlewares/tokens';

// Delete session endpoint, deletes an existing session, essentially loging out the user
server
	.delete<void, ReqWithTokens>('/session')
	.use(readTokens({ requireSessionToken: true }))
	.use(async ({ req, res }) => {
		await destroySession(req.tokens.session);

		res.writeHead(200);
		res.end();
	});
