
import { server } from '../../../server';
import { db } from '../../../database';
import { HttpError } from '@celeri/http-error';
import { readTokens } from '../../../middlewares/tokens';
import { destroySession } from './service';

// Delete session endpoint, deletes an existing session, essentially loging out the user
server
	.delete('/session')
	.use(readTokens({ requireSessionToken: true }))
	.use(async ({ req, res }) => {
		await destroySession(req.tokens.session);

		res.writeHead(200);
		res.end();
	});
