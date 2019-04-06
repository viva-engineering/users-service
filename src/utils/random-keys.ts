
import { randomBytes } from 'crypto';

const charsets = {
	alphaLower: 'abcdefghijklmnopqrstuvwxyz',
	alphaUpper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
	numeric: '1234567890',
	symbol: '!@#$%^&*()/?;:|[]-=_+`~.,><'
};

const sessionKeyCharset = charsets.alphaLower + charsets.alphaUpper + charsets.numeric + charsets.symbol;
const friendCodeCharset = charsets.alphaUpper + charsets.numeric;

/**
 * Generates a cryptographically strong random session token from a pool of ~3.3e249 possible
 * token values.
 */
export const generateSessionKey = () : Promise<string> => {
	return randomString(128, sessionKeyCharset);
};

/**
 * Generates a random friend code.
 */
export const generateFriendCode = () : Promise<string> => {
	return randomString(20, friendCodeCharset);
};

const randomString = (length: number, charset: string) : Promise<string> => {
	return new Promise((resolve, reject) => {
		const chars: string[] = new Array(length);

		randomBytes(length, (error, bytes) => {
			if (error) {
				return reject(error);
			}

			for (let i = 0; i < length; i++) {
				chars[i] = charset[bytes[i] % charset.length];
			}

			resolve(chars.join(''));
		});
	});
};
