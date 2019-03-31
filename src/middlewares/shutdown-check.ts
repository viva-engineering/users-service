
import { MiddlewareInput } from '@celeri/http-server';
import { MiddlewareFunction } from '@celeri/middleware-pipeline';
import { isShuttingDown } from '@viva-eng/cluster';
import { HttpError } from '@celeri/http-error';

/**
 * Request middleware that checks the status of the server. If the server
 * is currently shutting down, the server will return a 503 response.
 */
export const shutdownCheck: MiddlewareFunction<MiddlewareInput> = ({ req, res }) => {
	if (isShuttingDown()) {
		throw new HttpError(503, 'This server instance is currently shutting down. Please try the request again.');
	}
};
