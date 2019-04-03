
const endpointFiles: string[] = [
	'healthcheck',
	'register',
	'session'
];

export const loadEndpoints = () => {
	endpointFiles.forEach((file) => require(`./${file}`));
};
