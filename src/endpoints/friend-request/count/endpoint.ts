
import { server } from '../../../server';
import { authenticate } from '../../../middlewares/authenticate';
import { getFriendRequestCount } from './service';

server
	.get('/friend-request/count')
	.use(authenticate({ required: true }))
	.use(async ({ req, res }) => {
		const count = await getFriendRequestCount(req.user);
		const payload = JSON.stringify({ count });

		res.writeHead(200, { 'content-type': 'application/json' });
		res.end(payload);
	});
