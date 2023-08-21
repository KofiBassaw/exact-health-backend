const asynHandler = require("../middleware/async");
const GlobalModel = require("../model/GlobalModel");
const DeviceModel = require("../model/DeviceModel");
const UtilityModel = require("../model/UtitlityModel")
const SessionModel = require("../model/SessionModel")
const UserModel = require("../model/UserModel")
const UtilityHelper = require("../helper/utilfunc");
const { myVars, RESPONSE_CODES,REGISTRATION_STATUS } = require("../helper/vars");
const { logger } = require("../logs/winston");
const { sendSMS } = require("../helper/autoRunner");
const cloudinary = require("../config/cloudinary");
const fs = require('fs');


exports.RegisterInitiateController = asynHandler(async (req, res, next) => {

    try{
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
    }catch(ex){

        logger.error("failed to create user");
        var resp = {
            status : RESPONSE_CODES.FAILED,
            message : "Unkwon error"
        };
        console.error('Error creating user', ex);
        console.log(ex);
        return UtilityHelper.sendResponse(res, 200, resp.message, resp)
    }

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











exports.LoginController = asynHandler(async (req, res, next) => {

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















exports.UserProfessionController = asynHandler(async (req, res, next) => {

     let session = req.session;
     console.log(session);

     let professionResp = await GlobalModel.Find('status',1,'user_type')


    var resp = {
        status : RESPONSE_CODES.SUCCESS,
        message : "Success",
        data : professionResp.rows
    };

    return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)

})





exports.UserPersonalDataController = asynHandler(async (req, res, next) => {

    let session = req.session;
    let user = req.user;
    let personalData = req.body;

    let persResponse = await UserModel.activePersonalData(user.user_id)

    if(persResponse.rowCount > 0)
    {
        let oldPersonalData = persResponse.rows[0];
        let persID = oldPersonalData.personal_data_id;
        delete oldPersonalData["personal_data_id"];
        oldPersonalData.status = 0;
        GlobalModel.Update(oldPersonalData,'user_personal_data','personal_data_id',persID)
    }

    personalData.user_id = user.user_id;
    personalData.full_name = user.name;
    personalData.phone = user.phone_number;
    personalData.email = user.email;

    let newPersResponse = await GlobalModel.Create(personalData,'user_personal_data','');

    if(newPersResponse.rowCount < 1)
    {
        //request failed to save
    var resp = {
        status : RESPONSE_CODES.FAILED,
        message : "Unable to save personal Data"
    };

    return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)
    }

    var resp = {
        status : RESPONSE_CODES.SUCCESS,
        message : "Success",
        data : newPersResponse.rows[0]
    };

    return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)

})








exports.UserEducationDataController = asynHandler(async (req, res, next) => {

    let session = req.session;
    let user = req.user;
    let educationData = req.body;

   

    educationData.user_id = user.user_id;

    let newPersResponse = await GlobalModel.Create(educationData,'user_education','');

    if(newPersResponse.rowCount < 1)
    {
        //request failed to save
    var resp = {
        status : RESPONSE_CODES.FAILED,
        message : "Unable to save education information"
    };

    return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)
    }

    var resp = {
        status : RESPONSE_CODES.SUCCESS,
        message : "Success",
        data : newPersResponse.rows[0]
    };

    return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)

})



// end point for registering user employment history
exports.EmploymentController = asynHandler(async (req, res, next) => {

    let session = req.session;
    let user = req.user;
    let employmentData = req.body;

   

    employmentData.user_id = user.user_id;

    let newPersResponse = await GlobalModel.Create(employmentData,'user_employment_history','');

    if(newPersResponse.rowCount < 1)
    {
        //request failed to save
    var resp = {
        status : RESPONSE_CODES.FAILED,
        message : "Unable to save employment information"
    };

    return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)
    }

    var resp = {
        status : RESPONSE_CODES.SUCCESS,
        message : "Success",
        data : newPersResponse.rows[0]
    };

    return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)

})





// api to add employee references
exports.ReferenceDataController = asynHandler(async (req, res, next) => {

    let session = req.session;
    let user = req.user;
    let employmentData = req.body;

   

    employmentData.user_id = user.user_id;

    let newPersResponse = await GlobalModel.Create(employmentData,'user_reference','');

    if(newPersResponse.rowCount < 1)
    {
        //request failed to save
    var resp = {
        status : RESPONSE_CODES.FAILED,
        message : "Unable to save reference information"
    };

    return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)
    }

    var resp = {
        status : RESPONSE_CODES.SUCCESS,
        message : "Success",
        data : newPersResponse.rows[0]
    };

    return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)

})






exports.ApplicationDataController = asynHandler(async (req, res, next) => {

    let session = req.session;
    let user = req.user;
    let employmentData = req.body;
    //user.user_id
   
     let personalDataResp = await UserModel.activePersonalData(user.user_id);

     var personalData = null;
     if(personalDataResp.rowCount > 0)
     {
        personalData = personalDataResp.rows[0];
     }

     let educationList = await UserModel.activeEducationList(user.user_id);
     let employmentList = await UserModel.activeEmploymentList(user.user_id);
     let referenceList = await UserModel.activeReferenceList(user.user_id);

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




exports.CompleteUserApplicationSeetUpControler = asynHandler(async (req, res, next) => {

    let session = req.session;
    let user = req.user;
     
    let user_id = user.user_id;

    let statusUser = {
        registration_status : REGISTRATION_STATUS.PENDING_REVIEW
    }
        

    let updateResp = await GlobalModel.Update(statusUser,'user_profile','user_id',user_id);


    if(updateResp.rowCount < 1)
    {
        //failed to update user details
        var resp = {
            status : RESPONSE_CODES.FAILED,
            message : "Unable to complete application set up"
        };
        return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)
    }

    let userReg = UtilityHelper.formateUser( updateResp.rows[0]);
 

      //failed to update user details
      var resp = {
        status : RESPONSE_CODES.SUCCESS,
        message : "Success",
        data: userReg
    };


   return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)

})











exports.ReturnToApplicationControler = asynHandler(async (req, res, next) => {

    let session = req.session;
    let user = req.user;
     
    let user_id = user.user_id;

    let statusUser = {
        registration_status : REGISTRATION_STATUS.PENDING_APPLICATION
    }
        

    let updateResp = await GlobalModel.Update(statusUser,'user_profile','user_id',user_id);


    if(updateResp.rowCount < 1)
    {
        //failed to update user details
        var resp = {
            status : RESPONSE_CODES.FAILED,
            message : "Unable to change user application status"
        };
        return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)
    }

    let userReg = UtilityHelper.formateUser( updateResp.rows[0]);
 

      //failed to update user details
      var resp = {
        status : RESPONSE_CODES.SUCCESS,
        message : "Success",
        data: userReg
    };


   return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)

})








exports.UpdateProfileControler = asynHandler(async (req, res, next) => {

    let session = req.session;
    let user = req.user;
    let {user_profile, schedules} = req.body;
    
    let user_id = user.user_id;
    user_profile.registration_status = REGISTRATION_STATUS.COMPLETED;


    let updateResp = await GlobalModel.Update(user_profile,'user_profile','user_id',user_id);


    if(updateResp.rowCount < 1)
    {
        //failed to update user details
        var resp = {
            status : RESPONSE_CODES.FAILED,
            message : "Failed to update details"
        };
        return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)
    }

    let userReg = updateResp.rows[0];
    

    var scheduleRes = [];
    if (schedules)
    {

         scheduleRes = await UserModel.bulkAddUserSchedules(schedules,user_id);
        console.log('Inserted rows:', scheduleRes.length );
        if(scheduleRes.length < 1)
        {
            var resp = {
                status : RESPONSE_CODES.FAILED,
                message : "Failed to create schedules"
            };
            return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)
        }
    }



   
   

   
    delete userReg["id"];
    delete userReg["user_id"];
    delete userReg["password"];

      //failed to update user details

      var responseData = {
        user: userReg,
        schedules: scheduleRes
     }


      var resp = {
        status : RESPONSE_CODES.SUCCESS,
        message : "Success",
        data: responseData
    };
   return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)

})












exports.Schedules = asynHandler(async (req, res, next) => {

    let session = req.session;
    let user = req.user;
    
    let user_id = user.user_id;




    scheduleRes = await UserModel.schedules(user_id);
    var scheduleRes = scheduleRes.rows; 
    



   
  

      var resp = {
        status : RESPONSE_CODES.SUCCESS,
        message : "Success",
        data: scheduleRes
    };
   return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)

})


exports.UserProfileControler = asynHandler(async (req, res, next) => {

    let session = req.session;
    let user = req.user;
    
    let user_id = user.user_id;


    let userReg = user;
    

   
    delete userReg["id"];
    delete userReg["user_id"];
    delete userReg["password"];

      //failed to update user details

  

      var resp = {
        status : RESPONSE_CODES.SUCCESS,
        message : "Success",
        data: userReg
    };
   return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)

})









exports.UploadProfieleImage = asynHandler(async (req, res, next) => {

    let session = req.session;
    let user = req.user;


    try {
        const result = await cloudinary.uploader.upload(req.file.path);
       
        fs.unlinkSync(req.file.path);

        let userObj = {
            cloudinary_data:result,
            profile_url: result.secure_url
        }


    let updateResp = await GlobalModel.Update(userObj,'user_profile','user_id',user.user_id);


    if(updateResp.rowCount < 1)
    {
        //failed to update user details
        var resp = {
            status : RESPONSE_CODES.FAILED,
            message : "Failed to update details"
        };
        return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)
    }


    userReg = updateResp.rows[0];
    delete userReg["id"];
    delete userReg["user_id"];
    delete userReg["password"];
    delete userReg["cloudinary_data"];


   
    var resp = {
        status : RESPONSE_CODES.SUCCESS,
        message : "Success",
        data: userReg
    };

    return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)

      } catch (error) {
        console.error(error);
          console.log(error);
    var resp = {
        status : RESPONSE_CODES.FAILED,
        message : "Success"
    };

    return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)
      }

})