'use strict';

/**
 config.js

 This is the main configuration file. It provides a series of default configuration options that
 can be overridden based on the environment.

 @author Clay Gulick
 @email clay@ratiosoftware.com

**/

let fs = require('fs'),
    winston = require('winston');

let config = null;

//short circuit to use cached config
if(config)
    return module.exports = config;

//grab the default config
let default_config = require('./default');

//determine the current environment and include the proper config file
//first check to see if a config file exists for the current NODE_ENV
let err = fs.accessSync(__dirname + "/" + process.env.NODE_ENV + ".js", fs.R_OK);
if(err) {
    winston.error(`Error loading environment config for: ${process.env.NODE_ENV} ${err}`);
    throw err;
}

//get the environment config
let environment_config = require('./' + process.env.NODE_ENV);

//override defaults with the environment config
config = Object.assign(default_config, environment_config);

module.exports = config;


