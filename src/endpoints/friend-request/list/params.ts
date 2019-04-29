
import { HttpError } from '@celeri/http-error';
import { MiddlewareInput } from '@celeri/http-server';

const isInt = /^[0-9]+$/;

export interface Req {
	query: Query;
}

export interface Query {
	page: string;
}

export const validateQuery = () => {
	return ({ req, res }: MiddlewareInput<void, Req>) => {
		if (! isInt.test(req.query.page)) {
			throw new HttpError(400, 'Invalid value for query parameter "page"');
		}
	};
};
