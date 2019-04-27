
import { server } from '../../../server';
import { authenticate } from '../../../middlewares/authenticate';

interface PathParams {
	userCode: string;
}

server
	.post<PathParams>('/friend/:userCode')
	.use(authenticate({ required: true }))
	.use(async ({ req, res }) => {
		await addFriend(req.user.userId, req.params.userCode);
		const payload = JSON.stringify(users);

		res.writeHead(200, { 'content-type': 'application/json' });
		res.end(payload);
	});
