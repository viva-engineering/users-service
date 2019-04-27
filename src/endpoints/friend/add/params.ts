
import { Route } from '@celeri/router';
import { MiddlewareFunction } from '@celeri/middleware-pipeline';
import { Server, Request, MiddlewareInput } from '@celeri/http-server';
import { IncomingMessage } from 'http';

// const foo: Request = { } as Request;

// foo.params
// foo.glob



// interface Request<Params, Query> {
// 	params: Params;
// 	query: Query;
// }

// const server = {
// 	get<R extends Request<any, any>>(url: string) {
// 		return {
// 			use(callback: (params: { req: R }) => void) {
// 				// 
// 			}
// 		}
// 	}
// };

// interface Params {
// 	foo: string;
// }

// interface Query {
// 	bar: number;
// }

// interface Req extends Request<Params, Query> { }

// server
// 	.get('/foo')
// 	.use(({ req }) => {
// 		req.params
// 		req.query
// 	})
