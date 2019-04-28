
import { server } from '../../../server';
import { authenticate } from '../../../middlewares/authenticate';
import { Params } from './params';
import { createFriendRequest } from './service';

server
	.post<Params>('/friend-request/:userCode')
	.use(authenticate({ required: true }))
	.use(async ({ req, res }) => {
		await createFriendRequest(req.user, req.params.userCode);

		res.writeHead(201, { });
		res.end();
	});
