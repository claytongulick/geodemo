'use strict';

/**
 * helper-cluster.js
 *
 * Utility for starting and managing express cluster
 *
 * @author Clay Gulick
 * @email claytongulick@gmail.com
 */
let cluster = require('cluster'),
    http = require('http'),
    https = require('https'),
    fs = require('fs'),
    winston = require('winston');

let config = require('../../env/config');

let workers = [];

/**
 * Start a cluster of worker processes and monitor their health, with optional automatic restart of a failed
 * process.
 */
function startCluster() {
    winston.info("Starting cluster. Spawning " + config.process_count + " workers...");
    for(let i=0; i < config.process_count; i++) {
        workers.push(cluster.fork());
    }

    cluster.on('exit',
        (worker, code, signal) => {
            winston.warn(`Process ${worker.process.pid} died. Code: ${code}. Signal: ${signal}`);
        }
    )
}

/**
 * Spin up the express server
 */
function startWebServer() {
    winston.info("Starting web server worker with process id: " + process.pid);

    //create the connection pool for future use. It's a singleton and will be returned on any require() call
    winston.info("Creating database connection pool...")
    let pool = require('./helper-pg');

    //set up routes and middleware
    winston.info("Configuring application...")
    let app = require('./helper-express');

    //set the process to the correct user and group after starting the web server
    function downgradePermissions() {
        if(config.posix_info && process.platform == 'linux') {
            console.log("Configuring posix user and group...");
            app.set('uid', config.posix_info.uid);
            process.setgid(config.posix_info.gid);
            process.setuid(config.posix_info.uid);
            winston.info(`Process permissions set to uid: ${config.posix_info.uid} gid: ${config.posix_info.gid}`);
        }
    }

    function launchSSLServer() {
        let options = config.ssl.options; 
        let https_server = https.createServer(options, app).listen(config.ssl.port, 
            () => {
                winston.info(`HTTPS server listening on port ${config.ssl.port}`);
                downgradePermissions();
            }
        );
    }

    //start listening on the configured port
    let http_server = http.createServer(app).listen(config.port,
        () => {
            winston.info(`HTTP server listening on port ${config.port}`);
            if(config.ssl.enable) 
                return launchSSLServer();
            downgradePermissions();
        } 
    );


    //listen for a termination signal and kill the web server. This allows for graceful shutdown.
    process.on('SIGTERM',
        function(){
            console.log("Received SIGTERM - shutting down...");
            http_server.close();
            process.exit();
        });
}

//if this is the master process, fork the number of desired cluster processes.
//for simplified debugging when running locally, or optionally in any environment where process_count == 1, we skip
//the cluster creation and just run a single process
if(cluster.isMaster && config.process_count > 1)
    startCluster();
else
    startWebServer();

