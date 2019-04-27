
import { server } from '../../../server';
import { authenticate } from '../../../middlewares/authenticate';
import { queryParser } from '@celeri/query-parser';
import { validateQuery, Req } from './params';
import { findUsers } from './service';

server
	.get<void, Req>('/user')
	.use(authenticate({ required: true }))
	.use(queryParser())
	.use(validateQuery)
	.use(async ({ req, res }) => {
		const users = await findUsers(req.query, req.user);
		const payload = JSON.stringify(users);

		res.writeHead(200, { 'content-type': 'application/json' });
		res.end(payload);
	});
