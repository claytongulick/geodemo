/**
 server.js

 Starting point for launching API server.

 @author Clayton Gulick <claytongulick@gmail.com>
**/

let winston = require('winston');

winston.info('Starting API service...');
winston.info('Initializing environment configuration...');

//first, evaluate the current NODE_ENV for a valid environment
let environments = ['local','development','qa','production'];

if(environments.indexOf(process.env.NODE_ENV) < 0) {
    winston.warn('Invalid or missing NODE_ENV value: ' + process.env.NODE_ENV + ', should be one of: ' + environments.join(',') + '. Defaulting to "local".');
    process.env.NODE_ENV = 'local';
}

//configure the logging level based on the current environment.
let logging_level = 'debug';
if(['local','development'].indexOf(process.env.NODE_ENV) >= 0)
    logging_level = 'verbose';

winston.level = logging_level;

//start the HTTP cluster
require('./app/helpers/helper-cluster');