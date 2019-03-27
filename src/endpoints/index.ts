
const endpointFiles: string[] = [
	'healthcheck'
];

export const loadEndpoints = () => {
	endpointFiles.forEach((file) => require(`./${file}`));
};
