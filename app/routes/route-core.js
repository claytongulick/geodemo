'use strict';

/**
 route-core.js

 Core server routes with generic functionality that's not application specific, such as isalive and whoami

 @author Clayton Gulick <claytongulick@gmail.com>

 **/

const Core = require('../controllers/controller-core');

module.exports = (app) => {

    /**
     * Most basic route, simple "is alive" check to see if the server is running
     */
    app.route('/isalive').get(Core.isAlive);
    


};
