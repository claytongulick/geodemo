/**
 * Wrap an express route function so that it works with promises asymc/await.
 * When an exception is raised in the promise, the next arg is called with the error (.catch(args[2])) 
 * So any function that uses this must have the standard express signature (req, res, next) => { ... }
 * @param {*} fn 
 * @author Clayton Gulick <claytongulick@gmail.com>
 */
function wrap(fn) {
    return (req, res, next) => {
        fn(req, res, next)
            .catch(
                (err) => {
                    console.log(err);
                    next(err);
                }
            );
        }
}

module.exports = {
    wrap: wrap
}