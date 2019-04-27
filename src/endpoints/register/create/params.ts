
import { HttpError } from '@celeri/http-error';
import { MiddlewareInput } from '@celeri/http-server';
import { StringField, EmailField } from '@viva-eng/payload-validator';
import { schemaValidator } from '../../../utils/validate-schema';

export interface Req {
	body?: Body;
}

export interface Body {
	email: string;
	password: string;
}

const validate = schemaValidator<Body>({
	email: new EmailField({ required: true }),
	password: new StringField({ required: true, minLength: 8, maxLength: 160 })
});

/**
 * Validates a request payload for the `POST /registration` endpoint
 */
export const validateBody = ({ req, res }: MiddlewareInput<void, Req>) => {
	if (! req.body) {
		throw new HttpError(400, 'Request payload is required', {
			expected: {
				email: 'string',
				password: 'string'
			}
		});
	}

	const errors = validate(req.body);

	// If there were validation failures, return an error to the client
	if (errors) {
		throw new HttpError(422, 'Invalid request body contents', { errors });
	}
};
