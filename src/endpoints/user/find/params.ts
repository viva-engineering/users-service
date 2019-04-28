
import { HttpError } from '@celeri/http-error';
import { MiddlewareInput } from '@celeri/http-server';
import { StringField, NumberField, EmailField } from '@viva-eng/payload-validator';
import { userCodeField } from '../../../utils/validate-schema';

export interface Req {
	query?: QueryParams
}

export interface QueryParams {
	name?: string;
	email?: string;
	phone?: string;
	userId?: number;
	userCode?: string;
}

const validators = {
	name: new StringField({ minLength: 1, maxLength: 255 }),
	email: new EmailField({ }),
	phone: new StringField({ regex: /^\+?[1-9]\d{1,14}$/ }),
	userId: new NumberField({ minValue: 1, allowString: true }),
	userCode: userCodeField()
};

export const validateQuery = ({ req, res }: MiddlewareInput<void, Req>) => {
	const query = req.query as QueryParams;

	if (! query) {
		throw new HttpError(400, 'Must provide a search parameter', { });
	}

	const parameterCount =
		(query.name == null ? 0 : 1) +
		(query.email == null ? 0 : 1) +
		(query.phone == null ? 0 : 1) +
		(query.userId == null ? 0 : 1 ) +
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
				userId: 'number',
				userCode: 'string'
			}
		});
	}

	if (query.name != null) {
		const errors = validators.name.validate(query.name);

		if (errors.length) {
			throw new HttpError(422, 'Invalid search parameter "name"', { errors });
		}
	}

	if (query.email != null) {
		const errors = validators.email.validate(query.email);

		if (errors.length) {
			throw new HttpError(422, 'Invalid search parameter "email"', { errors });
		}
	}

	if (query.phone != null) {
		const errors = validators.phone.validate(query.phone);

		if (errors.length) {
			throw new HttpError(422, 'Invalid search parameter "phone"', { errors });
		}
	}

	if (query.userId != null) {
		const errors = validators.userId.validate(query.userId);

		if (errors.length) {
			throw new HttpError(422, 'Invalid search parameter "userId"', { errors });
		}

		query.userId = parseFloat(query.userId as any as string);
	}

	if (query.userCode != null) {
		const errors = validators.userCode.validate(query.userCode);

		if (errors.length) {
			throw new HttpError(422, 'Invalid search parameter "userCode"', { errors });
		}
	}
};
