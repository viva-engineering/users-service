
// import { server } from '../../../server';
// import { bodyParser } from '@celeri/body-parser';
// import { authorize } from '../../../middlewares/authorize';
// import { authenticate } from '../../../middlewares/authenticate';
// import { MiddlewareInput } from '@celeri/http-server';
// import { HttpError } from '@celeri/http-error';
// import { overrideUserAttributes, OverrideUserAttributesBody } from './service';

// server
// 	.patch('/user/:userCode/override')
// 	.use(authenticate({ required: true }))
// 	.use(authorize({ requireModerator: true }))
// 	.use(bodyParser({ maxSize: '5kb' }))
// 	.use(async ({ req, res }) => {
// 		const body = req.body as OverrideUserAttributesBody;

// 		await overrideUserAttributes(req.params.userCode, body, req.user);

// 		res.writeHead(200);
// 		res.end();
// 	});
