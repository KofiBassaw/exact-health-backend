const asynHandler = require("../middleware/async");
const GlobalModel = require("../model/GlobalModel");
const DeviceModel = require("../model/DeviceModel");
const UtilityModel = require("../model/UtitlityModel")
const SessionModel = require("../model/SessionModel")
const UtilityHelper = require("../helper/utilfunc");
const { myVars,ACTIVITYIDS, RESPONSE_CODES } = require("../helper/vars");
const { logger } = require("../logs/winston");
const { sendSMS } = require("../helper/autoRunner");


exports.RegisterInitiateController = asynHandler(async (req, res, next) => {

    let userData = req.body;
    let userAgentObj = req.headers;
    let {useragent} = userAgentObj;

    let userAgent = JSON.parse(useragent); 


    let phoneNum =  UtilityHelper.formatPhone(userData.phone_number);

    userData.phone_number = phoneNum;

    //console.log("raw password "+ userData.password);

    let rawPassword = userData.password;
    let passwordHarsh  = UtilityHelper.sha256Encrypt(rawPassword);
   
    console.log("encrypted password: "+ passwordHarsh);
    userData.password = passwordHarsh;



    let oldUser = await GlobalModel.Find('phone_number',userData.phone_number,'user_profile');

    if(oldUser.rowCount >= 1)
    {
        //user with phone number exist
        let resp = {
            status : RESPONSE_CODES.FAILED,
            message : "phone number already exist, consider loggin in"
        };

        return UtilityHelper.sendResponse(resp, 200, resp.message, resp)
    }

    let oldUser2 = await GlobalModel.Find('email',userData.email,'user_profile');


    if(oldUser2.rowCount >= 1)
    {
        //user with email exist
        var resp = {
            status : RESPONSE_CODES.FAILED,
            message : "phone number already exist, consider loggin in"
        };
        return UtilityHelper.sendResponse(res, 200, resp.message, resp)

    }


    let otp = UtilityHelper.generateOTP(4);
    otpHash = UtilityHelper.sha256Encrypt(otp);

    let  smsMessage = "Your One-Time-Password is "+otp+". If you have not initiated request on the exact help app, kindly ignore this message, or contact our Contact Centre toll free on XXXXXXXXXX. Thank you";
    
    var extraData = {
        user: userData,
        userAgent : userAgent
    }

    let password_res = {
        reset_password_code : otpHash ,
        extra_data : extraData
    };

    let resetPassResp = await GlobalModel.Create(password_res, 'password_reset', '');

    if(resetPassResp.rowCount < 1)
    {
        logger.error("Unable create temporal user");
        var resp = {
            status : RESPONSE_CODES.FAILED,
            message : "Unable to create temporal user"
        };
        return UtilityHelper.sendResponse(res, 200, resp.message, resp)
    }


    //ormit await function to execute request at the background
    sendSMS(smsMessage,myVars.APPLICATION_NAME,userData.phone_number);


    resetPassObj = resetPassResp.rows[0];

    var resp = {
        status : RESPONSE_CODES.SUCCESS,
        message : "Kindly provide the OTP sent to your phone number to complete your registeration",
        data : resetPassObj.reset_id
    };
    return UtilityHelper.sendResponse(res, 200, resp.message, resp)

})



exports.RegisterConfirmOtpController = asynHandler(async (req, res, next) => {

    let{otp,reset_id} = req.body;

    let otpHarsh = UtilityHelper.sha256Encrypt(otp);

    let resetResp = await UtilityModel.passwordResetDetails(otpHarsh,reset_id)

    if(resetResp.rowCount < 1)
    {
        logger.error("Invalid otp");
        var resp = {
            status : RESPONSE_CODES.FAILED,
            message : "Invalid otp"
        };
        return UtilityHelper.sendResponse(res, 200, resp.message, resp)
    }

    let resetData  = resetResp.rows[0];

    let {user,userAgent} = resetData.extra_data;

  
    resetData.status = 0;
    delete resetData["reset_id"]; 
    let updateRes = await GlobalModel.Update(resetData,"password_reset","reset_id",reset_id);
  


    let userRes = await GlobalModel.Create(user,'user_profile','')

    if(userRes.rowCount < 1)
    {
        //failed to user details
        logger.error("Failed to register user");
        var resp = {
            status : RESPONSE_CODES.FAILED,
            message : "Failed to register user"
        };
        return UtilityHelper.sendResponse(res, 200, resp.message, resp)

    }

    let userReg  = userRes.rows[0];
    let reqHeaders = req.headers;
    let {platform} = reqHeaders;


    let deviceResp = await DeviceModel.details(userAgent.imei,platform);

    if(deviceResp.rowCount > 0)
    {
        let oldDevice = deviceResp.rows[0];
        let device_id = oldDevice.device_id;
        oldDevice.status = 0;
        delete oldDevice["device_id"]; 
        let devRes = await GlobalModel.Update(oldDevice,"user_device","device_id",device_id);
    }
   
    let newDevice = {
        user_id: userReg.user_id,
        device_imei: userAgent.imei,
        device_name: userAgent.broswerName,
        device_type: platform,
        firebase_id: userAgent.notification_id
    };
    let deviceRes =  GlobalModel.Create(newDevice,'user_device','');

    //create a session

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


    var resp = {
        status : RESPONSE_CODES.SUCCESS,
        message : "Success",
        data : sessionResObj.session_id
    };

    return UtilityHelper.sendResponse(res, 200, resp.message, resp)


})
