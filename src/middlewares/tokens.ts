
import { MiddlewareInput } from '@celeri/http-server';
import { HttpError } from '@celeri/http-error';
import { errorHandler } from './error-handler';

export interface ReqWithTokens {
	tokens?: {
		session?: string;
		application?: string;
	}
}

interface ReadTokensParams {
	requireSessionToken?: true;
	requireApplicationToken?: true;
}

/**
 * Reads any auth tokens in the request and stores them on the request object
 */
export const readTokens = (params: ReadTokensParams = { }) => {
	return ({ req, res }: MiddlewareInput<any, ReqWithTokens>) => {
		req.tokens = {
			session: getToken(req.headers['x-user-token'], params.requireSessionToken),
			application: getToken(req.headers['x-application-secret'], params.requireApplicationToken)
		};
	};
};

const getToken = (token: string | string[], required: boolean) : string => {
	if (required && ! token) {
		throw new HttpError(401, 'Must provide a session token');
	}

	if (Array.isArray(token)) {
		if (token.length > 1) {
			throw new HttpError(400, 'Received multiple session token headers');
		}

		return token[0];
	}

	return token;
};
