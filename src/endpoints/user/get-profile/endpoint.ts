
import { server } from '../../../server';
import { authenticate } from '../../../middlewares/authenticate';
import { getUser } from './service';
import { Params } from './params';

server
	.get<Params>('/user/:userCode')
	.use(authenticate({ required: true }))
	.use(async ({ req, res }) => {
		const userCode = req.params.userCode;
		const user = await getUser(req.params.userCode, req.user);
		const payload = JSON.stringify(user);

		res.writeHead(200, { 'content-type': 'application/json' });
		res.end(payload);
	});
