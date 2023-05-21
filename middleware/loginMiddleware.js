const asyncHandler = require("./async");



exports.CheckAgent = asyncHandler(async (req, res, next) => {
    let userAgentString = req.headers?.userAgent
    let userAgent = eval(userAgentString);
    console.log('i passed midware');
    req.newvalue = "me"
    // let result = await VerificationModel.FindByUserId(user_id);
    // let UserInfo = result.rows[0]
  
  
    // if (!UserInfo) {
    //   return next()  // if user does not exist, proceed to verification
    // }
    // if (UserInfo.status == 1) {
    //   CatchHistory({ payload: JSON.stringify(user_id, pin), api_response: `User with ${user_id} has already completed kyc`, function_name: 'CheckCompleted', date_started: systemDate, sql_action: "SELECT", event: "Identity Verification", actor: user_id }, req)
    //   return sendResponse(res, 0, 401, 'Sorry This account has already been processed by COLLABO')
    // }
    // req.UserInfo = UserInfo
    return next()
})