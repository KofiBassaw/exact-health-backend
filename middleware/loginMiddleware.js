const asyncHandler = require("./async");



exports.CheckLoginAgent = asyncHandler(async (req, res, next) => {
    let header = req.headers
    let {useragent,platform} = header;

    let userAgentObj =  JSON.parse(useragent);

    req.userAgent = userAgentObj;
    req.platform = platform;

 
    return next()
})