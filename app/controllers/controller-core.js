'use strict';

/**
 controller-core.js

 Base controllers for non application specific routes, basic server housekeeping functions like isAlive, etc...

 @author Clay Gulick
 @email clay@ratiosoftware.com
**/

class Core {
    static isAlive(req, res) {
        res.json({
            status: 'OK'
        });
    }
}

module.exports = Core;