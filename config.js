
const http = {
	address: '0.0.0.0',
	port: 8080
};

const logging = {
	stackTraceLimit: 100,
	logLevel: 'debug',
	output: 'pretty',
	colors: true
};

const cluster = {
	threads: 0,
	heapSize: 1024
};

module.exports = {
	http,
	logging,
	cluster
};
