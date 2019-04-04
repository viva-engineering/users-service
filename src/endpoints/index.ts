
const endpoints: string[] = [
	'./healthcheck',
	'./register/create/endpoint',
	'./session/create/endpoint',
	'./session/destroy/endpoint',
	'./session/read/endpoint',
	'./session/renew/endpoint'
];

export const loadEndpoints = () => {
	endpoints.forEach((file) => require(file));
};
