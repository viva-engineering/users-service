
import { logger } from '../logger';
import { errorHandler as middleware, HttpError } from '@celeri/http-error';

interface ErrorPayload {
	message: string;
	additionalInfo?: any;
}

export const formatError = ({ error }) : ErrorPayload => {
	if (! (error instanceof HttpError)) {
		logger.warn('The error handler caught something that was not an HttpError instance; This might be a bug', { error });

		return {
			message: 'An unexpected error has occured'
		};
	}

	return {
		message: error.message,
		additionalInfo: error.meta
	};
};

export const errorHandler = middleware(formatError);
