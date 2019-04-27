
import { HttpError } from '@celeri/http-error';
import { MiddlewareInput } from '@celeri/http-server';
import { UserRole } from '@viva-eng/viva-database';

type Input = MiddlewareInput<any, any>;

export interface AuthorizeParams {
	require?: UserRole[]
}

export const authorize = (params: AuthorizeParams) => {
	const roles = new Set(params.require || [ ]);
	const isAuthorized = params.require && params.require.length
		? (req: Input['req']) => req.user && roles.has(req.user.userRole)
		: (req: Input['req']) => true;

	return ({ req, res }: Input) => {
		if (! isAuthorized(req)) {
			throw new HttpError(403, 'Not authorized');
		}
	};
};
