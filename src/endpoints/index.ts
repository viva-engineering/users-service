
const endpoints: string[] = [
	'./healthcheck',
	'./register/create/endpoint',
	'./session/create/endpoint',
	'./session/destroy/endpoint',
	'./session/read/endpoint',
	'./session/renew/endpoint',
	'./user/find/endpoint',
	'./user/get-profile/endpoint',
	'./friend-request/add/endpoint'
];

export const loadEndpoints = () => {
	endpoints.forEach((file) => require(file));
};
