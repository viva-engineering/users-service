
import { server } from '../../../server';
import { bodyParser } from '@celeri/body-parser';
import { validateBody, Req } from './params';
import { registerUser } from './service';

server
	.post<void, Req>('/registration')
	.use(bodyParser({ maxSize: '2kb' }))
	.use(validateBody)
	.use(async ({ req, res }) => {
		await registerUser(req.body);

		res.writeHead(201);
		res.end();
	});
