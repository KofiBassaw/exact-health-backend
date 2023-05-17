const { logger } = require("../logs/winston");
const {myVars,ProcessStatus } = require("../helper/vars");

let ussd = {};

ussd.sendResponse = (res, code,message, data) => {
        data?.requestType == myVars.CLEANUP ? logger.error(message) : logger.info(message)
        res.status(code).json(data)
    };


    
module.exports = ussd
