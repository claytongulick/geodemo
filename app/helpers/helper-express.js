'use strict';

/**
 * helper-express.js
 *
 * Utility to configure and launch express server
 *
 * @author Clayton Gulick <claytongulick@gmail.com>
 *
 */


/**
 * Module dependencies.
 */
var express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    helmet = require('helmet'),
    methodOverride = require('method-override'),
    config = require('../../env/config'),
    _ = require('lodash'),
    glob = require('glob'),
    winston = require('winston'),
    compress = require('compression'),
    path = require('path');

let app = null;

//return singleton app instance
if(app)
    return module.exports = app;

// Initialize express app
app = express();

//set log level
winston.level = config.log_level;

// Use helmet to secure Express headers
app.use(helmet.frameguard('sameorigin'));
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
app.use(helmet.ieNoOpen());
app.disable('x-powered-by');

//configure statics
if (typeof config.statics_dir == 'string')
    app.use(express.static(path.resolve(config.statics_dir)));
else if (config.statics_dir.length > 0)
    config.statics_dir.forEach(
        function (dir) {
            app.use(express.static(path.resolve(dir)));
        }
    );

//set up http request logging
app.use(morgan('combined'));

//make json output pretty
app.set('json spaces', 2);

//disable any sort of view caching
app.set('view cache', false);

// Should be placed before express.static
app.use(compress({
    filter: function (req, res) {
        return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
    },
    level: 9
}));

// Request body parsing middleware should be above methodOverride
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '10mb'
}));

//allow the use of modern http verbs for older clients that might not support them (PUT, etc...)
app.use(methodOverride());

// Globbing routing files - include all of our defined routes
getGlobbedFiles('./app/routes/**/*.js').forEach(function (routePath) {
    require(path.resolve(routePath))(app);
});

//logging error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    next(err);
});

//send json error
app.use((err, req, res, next) => {
    res.status(500).send({ error: err.stack });
});

module.exports = app;


/**
 * Get files by glob patterns
 */
function getGlobbedFiles(globPatterns, removeRoot) {
    // For context switching
    let _this = this;

    // URL paths regex
    let urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

    // The output array
    let output = [];
    let files;

    // If glob pattern is array so we use each pattern in a recursive way, otherwise we use glob
    if (_.isArray(globPatterns)) {
        globPatterns.forEach(function(globPattern) {
            output = _.union(output, _this.getGlobbedFiles(globPattern, removeRoot));
        });
    } else if (_.isString(globPatterns)) {
        if (urlRegex.test(globPatterns)) {
            output.push(globPatterns);
        } else {
            files = glob.sync(globPatterns);
            if (removeRoot) {
                files = files.map(function(file) {
                    return file.replace(removeRoot, '');
                });
            }

            output = _.union(output, files);
        }
    }

    return output;
};
