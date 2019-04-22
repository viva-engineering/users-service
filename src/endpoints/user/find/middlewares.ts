
import { HttpError } from '@celeri/http-error';
import { MiddlewareInput } from '@celeri/http-server';
import { StringField, EmailField } from '@viva-eng/payload-validator';

export interface SearchUserQueryParams {
	name?: string;
	email?: string;
	phone?: string;
	userCode?: string;
}

const nameField = new StringField({ minLength: 1, maxLength: 255 });
const emailField = new EmailField({ });
const phoneField = new StringField({ regex: /^\+?[1-9]\d{1,14}$/ });
const userCodeField = new StringField({ minLength: 40, maxLength: 40 });

export const validateSearchQuery = ({ req, res }: MiddlewareInput) => {
	const query = req.query as SearchUserQueryParams;

	if (! query) {
		throw new HttpError(400, 'Must provide a search parameter', { });
	}

	const parameterCount =
		(query.name == null ? 0 : 1) +
		(query.email == null ? 0 : 1) +
		(query.phone == null ? 0 : 1) +
		(query.userCode == null ? 0 : 1);

	if (parameterCount > 1) {
		throw new HttpError(422, 'Must provide only one search parameter');
	}

	if (parameterCount < 1) {
		throw new HttpError(422, 'Must provide a search parameter', {
			parameters: {
				name: 'string',
				email: 'string',
				phone: 'string',
				friendCode: 'string'
			}
		});
	}

	if (query.name != null) {
		const errors = nameField.validate(query.name);

		if (errors.length) {
			throw new HttpError(422, 'Invalid search parameter "name"', { errors });
		}
	}

	if (query.email != null) {
		const errors = emailField.validate(query.email);

		if (errors.length) {
			throw new HttpError(422, 'Invalid search parameter "email"', { errors });
		}
	}

	if (query.phone != null) {
		const errors = phoneField.validate(query.phone);

		if (errors.length) {
			throw new HttpError(422, 'Invalid search parameter "phone"', { errors });
		}
	}

	if (query.userCode != null) {
		const errors = userCodeField.validate(query.userCode);

		if (errors.length) {
			throw new HttpError(422, 'Invalid search parameter "userCode"', { errors });
		}
	}
};
