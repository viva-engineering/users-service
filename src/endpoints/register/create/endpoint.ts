
import { server } from '../../../server';
import { bodyParser } from '@celeri/body-parser';
import { validatePostPayload, RegistrationRequest } from './middlewares';
import { registerUser } from './service';

server
	.post('/registration')
	.use(bodyParser({ maxSize: '2kb' }))
	.use(validatePostPayload)
	.use(async ({ req, res }) => {
		const body = req.body as RegistrationRequest;

		await registerUser(req.body);

		res.writeHead(201);
		res.end();
	});
