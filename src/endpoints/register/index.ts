
import { server } from '../../server';
import { db } from '../../database';
import { bodyParser } from '@celeri/body-parser';
import { validatePostPayload, RegistrationRequest } from './request-payload/post';
import { registerUser } from './register-user';

server
	.post('/registration')
	.use(bodyParser({ maxSize: '2kb' }))
	.use(validatePostPayload)
	.use(async ({ req, res }) => {
		const body = req.body as RegistrationRequest;

		await registerUser(req.body);

		res.writeHead(200);
		res.end();
	});
