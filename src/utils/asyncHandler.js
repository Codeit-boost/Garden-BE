// asyncHandler.js
function asyncHandler(handler) {
    return async function (req, res, next) {
        try {
            await handler(req, res , next);
        } catch (error) {
            next(error);
        }
    };
}

module.exports = asyncHandler;