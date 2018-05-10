'use strict';

/**
 default.js

 Default configuration options. These can be overridden in any environment config file.

 Be aware that overriding occurs via Object.assign, so objects will be copied in total, not deep property merge

 @author Clay Gulick
 @email claytongulick@gmail.com
**/
const fs = require('fs');
let config = {

    //the folder that statics will be served out of
    statics_dir: './dist',

    //where to put uploaded files
    uploads_dir: './uploads',

    //on *nix systems, applications can only open port 80 as root. After the server is started, the application
    //will need to downgrade its permissions to a specific user and group. Set that here, and set
    //the *nix file system permissions appropriately.
    posix_info: {
        uid: 'geodemo',
        gid: 'geodemo'
    },

    //the logging level to use for the winston logger
    log_level: 'info',

    //the http port to listen on
    port: 3000,

    //the number of worker processes to spawn in a cluster
    process_count: 1
};

module.exports = config;