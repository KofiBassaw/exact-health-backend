const asyncHandler = require("./async");
const SessionModel = require("../model/SessionModel")
const UserModel = require("../model/UserModel")
const { RESPONSE_CODES } = require("../helper/vars");
const UtilityHelper = require("../helper/utilfunc");


exports.CheckAgent = asyncHandler(async (req, res, next) => {

 
    let userAgentObj = req.headers;
    let {sessionid} = userAgentObj;

  
    let sessionResp = await SessionModel.activeSession(sessionid);

    if(sessionResp.rowCount < 1)
    {
        //invalid session 
         //user with phone number exist
         let resp = {
            status : RESPONSE_CODES.SESSION_EXPIRED,
            message : "Session has expired"
        };

        return UtilityHelper.sendResponse(res, 200, resp.message, resp)
    }

    let sessionObj = sessionResp.rows[0];
    req.session = sessionObj

    let userResp = await UserModel.details(sessionObj.user_id);

    if(userResp.rowCount < 1)
    {
        //invalid session 
         //user with phone number exist
         let resp = {
            status : RESPONSE_CODES.SESSION_EXPIRED,
            message : "Invalid user"
        };

        return UtilityHelper.sendResponse(res, 200, resp.message, resp)
    }


    let userObj = userResp.rows[0];
    req.user = userObj

    return next()
})