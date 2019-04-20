
import { MiddlewareInput, Request } from '@celeri/http-server';
import { MiddlewareFunction } from '@celeri/middleware-pipeline';
import { HttpError } from '@celeri/http-error';
import { errorHandler } from './error-handler';
import { logger } from '../logger';
import { fetchSession } from '../endpoints/session/read/service';
import { UserRole } from '@viva-eng/viva-database';

const enum AuthErrors {
	NeedsEmailValidation = 'NEEDS_EMAIL_VALIDATION',
	PasswordExpired = 'PASSWORD_EXPIRED'
}

export interface AuthenticatedUser {
	userId: number;
	userCode: string;
	token: string;
	email: string;
	name: string;
	userRole?: UserRole;
}

interface AuthenticateParams {
	required?: true;
}

export const authenticate = (params: AuthenticateParams = { }) : MiddlewareFunction<MiddlewareInput> => {
	return async ({ req, res }) => {
		const sessionToken = getToken(req.headers['x-user-token'], params.required);

		if (sessionToken) {
			const session = await fetchSession(sessionToken);

			if (session.needsEmailValidation) {
				throw new HttpError(403, 'Not allowed to take that action at this time', {
					code: AuthErrors.NeedsEmailValidation
				});
			}

			if (session.passwordExpired) {
				throw new HttpError(403, 'Not allowed to take that action at this time', {
					code: AuthErrors.PasswordExpired
				});
			}

			req.user = {
				userId: session.userId,
				userCode: session.userCode,
				token: sessionToken,
				email: session.email,
				name: session.name,
				userRole: session.userRole
			};
		}
	};
};

const getToken = (token: string | string[], required: boolean) : string => {
	if (required && ! token) {
		throw new HttpError(401, 'Authentication required');
	}

	if (Array.isArray(token)) {
		if (token.length > 1) {
			throw new HttpError(400, 'Received multiple session token headers');
		}

		return token[0];
	}

	return token;
};

declare module '@celeri/http-server' {
	interface Request {
		user?: AuthenticatedUser;
	}
}
