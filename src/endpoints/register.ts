
import { server } from '../server';
import { db } from '../database';

server
	.get('/healthcheck')
	.use(({ req, res }) => {
		// 
	});
