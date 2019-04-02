
import { randomBytes } from 'crypto';

export const generateSessionKey = () => {
	return randomString(128, charsets.alphaLower + charsets.alphaUpper + charsets.numeric);
};

const charsets = {
	alphaLower: 'abcdefghijklmnopqrstuvwxyz',
	alphaUpper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
	numeric: '1234567890'
};

const randomString = (length: number, charset: string) : string => {
	const chars: string[] = new Array(length);
	const bytes: Buffer = randomBytes(length);

	for (let i = 0; i < length; i++) {
		chars[i] = charset[bytes[i] % charset.length];
	}

	return chars.join('');
};
