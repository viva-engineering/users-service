
import { db } from '@viva-eng/viva-database';
import { AuthenticatedUser } from '../../../middlewares/authenticate';

export interface OverrideUserAttributesBody {
	name?: string;
	active?: boolean;
	lockActive?: boolean;
	containsExplicitContent?: boolean;
	lockContainsExplicitContent?: boolean;
	explicitContentVisible?: boolean;
	lockExplicitContentVisible?: boolean;
}

export const overrideUserAttributes = async (userCode: string, body: OverrideUserAttributesBody, reqUser: AuthenticatedUser) => {
	const connection = await db.startTransaction(TransactionType.ReadWrite);

	try {
		const loginDetails = (await getLoginDetails.run({ email: body.email }, connection))[0];

		if (! loginDetails) {
			throw new HttpError(401, 'Invalid credentials', {
				code: ErrorCode.InvalidCredentials
			});
		}

		await verifyPassword(loginDetails.password_digest, body.password);

		if (! loginDetails.user_active) {
			throw new HttpError(401, 'Account is disabled', {
				code: ErrorCode.AccountDisabled
			});
		}

		if (! loginDetails.creds_active) {
			throw new HttpError(401, 'Account credentials are disabled', {
				code: ErrorCode.CredentialsDisabled
			});
		}

		const token = await generateSessionKey();
		const session = {
			userId: loginDetails.user_id,
			token
		};

		createSession.run(session, connection);

		await db.commitTransaction(connection);

		connection.release();

		const result: LoginResult = { token };

		if (! loginDetails.email_validated) {
			result.needsEmailValidation = true;
		}

		if (loginDetails.password_expired) {
			result.passwordExpired = true;
		}

		return result;
	}

	catch (error) {
		await db.rollbackTransaction(connection);

		connection.release();

		if (error instanceof HttpError) {
			throw error;
		}

		logger.warn('An unexpected error occured while trying to login', { error });

		throw new HttpError(500, 'Unexpected server error');
	}
};
