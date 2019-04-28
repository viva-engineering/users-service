
import { server } from '../../../server';
import { authenticate } from '../../../middlewares/authenticate';
import { Req } from './params';
import { getFriendRequests } from './service';

server
	.get<void, Req>('/friend-request')
	.use(authenticate({ required: true }))
	.use(async ({ req, res }) => {
		const page = parseInt(req.query.page, 10);
		const requests = await getFriendRequests(req.user, page);
		const payload = JSON.stringify(requests);

		res.writeHead(200, { 'content-type': 'application/json' });
		res.end(payload);
	});
