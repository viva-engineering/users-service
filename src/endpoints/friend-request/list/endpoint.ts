
import { server } from '../../../server';
import { authenticate } from '../../../middlewares/authenticate';
import { Req, validateQuery } from './params';
import { getFriendRequests } from './service';
import { queryParser } from '@celeri/query-parser';

server
	.get<void, Req>('/friend-request')
	.use(authenticate({ required: true }))
	.use(queryParser())
	.use(validateQuery())
	.use(async ({ req, res }) => {
		const page = parseInt(req.query.page, 10);
		const requests = await getFriendRequests(req.user, page);
		const payload = JSON.stringify(requests);

		res.writeHead(200, { 'content-type': 'application/json' });
		res.end(payload);
	});
