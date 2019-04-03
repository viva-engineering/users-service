
import { HttpError } from '@celeri/http-error';
import { MiddlewareInput } from '@celeri/http-server';
import { StringField, EmailField } from '@viva-eng/payload-validator';

export interface LoginRequest {
	email: string;
	password: string;
}

const schema = {
	email: new EmailField({ required: true }),
	password: new StringField({ required: true })
};

const schemaKeys = Object.keys(schema);

export interface ValidationErrors {
	email?: string[],
	password?: string[]
}

/**
 * Validates a request payload for the `POST /session` endpoint
 */
export const validatePostPayload = ({ req, res }: MiddlewareInput) => {
	const body = req.body as LoginRequest;

	if (! body) {
		throw new HttpError(400, 'Request payload is required', {
			expected: {
				email: 'string',
				password: 'string'
			}
		});
	}

	let hasErrors = false;
	const errors: ValidationErrors = { };

	schemaKeys.forEach((field) => {
		const value = body[field];
		const validator = schema[field];
		const fieldErrors: string[] = validator.validate(value);

		if (fieldErrors.length) {
			hasErrors = true;
			errors[field] = fieldErrors;
		}
	});

	// If there were validation failures, return an error to the client
	if (hasErrors) {
		throw new HttpError(422, 'Invalid request body contents', { errors });
	}
};
