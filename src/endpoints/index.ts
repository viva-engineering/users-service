
const endpointFiles: string[] = [
	'healthcheck',
	'register'
];

export const loadEndpoints = () => {
	endpointFiles.forEach((file) => require(`./${file}`));
};
