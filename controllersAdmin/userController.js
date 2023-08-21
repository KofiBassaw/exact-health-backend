const asynHandler = require("../middleware/async");
const GlobalModel = require("../model/GlobalModel");
const DeviceModel = require("../model/DeviceModel");
const UtilityModel = require("../model/UtitlityModel")
const SessionModel = require("../model/SessionModel")
const UserModel = require("../model/UserModel")
const UtilityHelper = require("../helper/utilfunc");
const { myVars, RESPONSE_CODES,REGISTRATION_STATUS, USER_TYPE } = require("../helper/vars");
const { logger } = require("../logs/winston");
const { sendSMS } = require("../helper/autoRunner");
const cloudinary = require("../config/cloudinary");
const fs = require('fs');







exports.AdminLoginController = asynHandler(async (req, res, next) => {

    let userAgent = req.userAgent;
    let platform = req.platform;
    let{email_or_phone,password} = req.body;


    email_or_phone = UtilityHelper.formatPhone(email_or_phone);
    password = UtilityHelper.sha256Encrypt(password);

    let resetResp = await UserModel.login(email_or_phone,password);

    if(resetResp.rowCount < 1)
    {
        logger.error("Invalid credentials");
        var resp = {
            status : RESPONSE_CODES.FAILED,
            message : "Invalid credentials"
        };
        return UtilityHelper.sendResponse(res, 200, resp.message, resp)
    }

    let userReg  = resetResp.rows[0];

 
if (userReg.user_type_id.toLowerCase() == USER_TYPE.PATIENT.toLowerCase())
{
    logger.error("Invalid access");
    var resp = {
        status : RESPONSE_CODES.FAILED,
        message : "UnAuthorized access"
    };
    return UtilityHelper.sendResponse(res, 200, resp.message, resp)
}


    let deviceResp = await DeviceModel.details(userAgent.imei,platform,userReg.user_id);

    if(deviceResp.rowCount < 1)
    {
        let newDevice = {
            user_id: userReg.user_id,
            device_imei: userAgent.imei,
            device_name: userAgent.broswerName,
            device_type: platform,
            firebase_id: userAgent.notification_id
        };
        let deviceRes =  GlobalModel.Create(newDevice,'user_device','');
    }
   
   

    //create a session
    var oldSession = {
        status : 0
    };
    await GlobalModel.Update(oldSession,'user_session','user_id',userReg.user_id);



    let sessionObj = {
        user_id :  userReg.user_id,
        last_updated : new Date(),
        platform: platform,
        mac_address: userAgent.macaddress,
        browser: userAgent.broswerName
    };

    //session_id, , date_added, , , , , status, cordinates
    let sessionRes = await SessionModel.Create(sessionObj,userAgent.latitude,userAgent.longitude)

    if(sessionRes.rowCount < 1)
    {
        logger.error("Failed create session");
        var resp = {
            status : RESPONSE_CODES.FAILED,
            message : "Failed create session"
        };
        return UtilityHelper.sendResponse(res, 200, resp.message, resp)
    }


    let sessionResObj = sessionRes.rows[0];

  


    console.log("Before clock in ")

    var clockInRes = await UserModel.currentClockIn(userReg.user_id);

    console.log("afetr clock in ")
 
     if(clockInRes.rowCount < 1)
     {
        //no clock for the day, clock in for user
        var clockInObj =  {
            user_id: userReg.user_id,
            session_id: sessionResObj.session_id
        }

        clockInRes = await GlobalModel.Create(clockInObj,'user_clock_in_history','');
     }

     
     

     let ClockObj = clockInRes.rows[0];
     delete ClockObj["user_id"];

     userReg = UtilityHelper.formateUser(userReg);
    
    
 
     var resp = {
         status : RESPONSE_CODES.SUCCESS,
         message : "Success",
         data : userReg,
         session_id : sessionResObj.session_id,
         clockIn : ClockObj
     };

    return UtilityHelper.sendResponse(res, 200, resp.message, resp)
})





exports.UserAdminAll = asynHandler(async (req, res, next) => {

    let session = req.session;
    console.log(session);

    let professionResp = await UserModel.all()


   var resp = {
       status : RESPONSE_CODES.SUCCESS,
       message : "Success",
       data : professionResp.rows
   };

   return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)

})





exports.UserAdminPendingReview = asynHandler(async (req, res, next) => {

    let session = req.session;
    console.log(session);

    let professionResp = await GlobalModel.Find('registration_status',REGISTRATION_STATUS.PENDING_REVIEW,'user_profile')


   var resp = {
       status : RESPONSE_CODES.SUCCESS,
       message : "Success",
       data : professionResp.rows
   };

   return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)

})





exports.AdminApplicationDataController = asynHandler(async (req, res, next) => {

    let {session,user,params} = req;
    let {user_id} = params;
    console.log(user_id)

     let personalDataResp = await UserModel.activePersonalData(user_id);

     var personalData = null;
     if(personalDataResp.rowCount > 0)
     {
        personalData = personalDataResp.rows[0];
     }

     let educationList = await UserModel.activeEducationList(user_id);
     let employmentList = await UserModel.activeEmploymentList(user_id);
     let referenceList = await UserModel.activeReferenceList(user_id);

     var respData = {
        personalData : personalData,
        education : educationList.rows,
        employment: employmentList.rows,
        reference: referenceList.rows
     }
      





    var resp = {
        status : RESPONSE_CODES.SUCCESS,
        message : "Success",
        data : respData 
    };

    return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)

})


exports.AdminUserReviewController = asynHandler(async (req, res, next) => {

let {user_id, status, comment} = req.body;
let session = req.session;
let user = req.user;

var reg_status =   REGISTRATION_STATUS.DECLINED;

if(status == 1)
{
    reg_status = REGISTRATION_STATUS.PENDING_PROFILE;
}

let userData = {
    reviewed_by : user.user_id,
    registration_status : reg_status,
    reviewer_comment : comment

};

console.log(userData)
let updateRes = await GlobalModel.Update(userData,"user_profile","user_id",user_id);

console.log(updateRes.rows[0]);
if(updateRes.rowCount <= 0)
{
    var resp = {
        status : RESPONSE_CODES.FAILED,
        message : "Unable to process request"
    };
    return UtilityHelper.sendResponse(res, 200, resp.message, resp)
}


var resp = {
    status : RESPONSE_CODES.SUCCESS,
    message : "Request successful"
};
return UtilityHelper.sendResponse(res, 200, resp.message, resp)

})