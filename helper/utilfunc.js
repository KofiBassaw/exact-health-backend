const { logger } = require("../logs/winston");
const otpGenerator = require('otp-generator');
const {RESPONSE_CODES } = require("../helper/vars");
const {createHash} = require('crypto');
const GlobalModel = require("../model/GlobalModel");

let ussd = {};

ussd.sendResponse = (res, code,message, data, session) => {

         if(session)
         {
          //there is a session update last update time of session
          let session_id = session.session_id;
          delete session["session"];
          delete session["cordinates"];

          session.last_updated = new Date();
          GlobalModel.Update(session,'user_session','session_id',session_id);
         }
        data?.status == RESPONSE_CODES.FAILED ? logger.error(message) : logger.info(message)
        res.status(code).json(data)
    };



    ussd.sha256Encrypt = (textPhrase) => {

      //console.log("raw text here: "+ textPhrase)
        const hash = createHash('sha256');
        for (let i = 0; i < textPhrase.length; i++) {
          const rawText = textPhrase[i].trim(); // remove leading/trailing whitespace
          if (rawText === '') continue; // skip empty lines
          hash.write(rawText); // write a single line to the buffer
        }
      
        return hash.digest('base64'); 
     };


     ussd.generateOTP = (length) => {
      const OTP = otpGenerator.generate(length);
      console.log('otp here: ' + OTP);



      if(length == 4)
      {
         return '1234'
      }else{
         return '123456'
      }

     // return OTP;
    };






     ussd.formatPhone = (phone) => {

      console.log("++++++++= phone: "+ phone)
      if(phone.startsWith('0') && phone.length == 10)
      {
        phone = phone.substring(1);
        phone =  "233" + phone;
      }else if(!phone.startsWith('0') && phone.length == 9)
      {
         phone = phone.substring(2);
         phone =  "233" + phone;
      }else if(phone.startsWith('+233'))
      {
         phone = phone.substring(1);
      }else  if(phone.startsWith('2330') && phone.length == 13)
      {
        phone = phone.substring(4);
        phone =  "233" + phone;
      }else  if(phone.startsWith('00233') && phone.length == 14)
      {
        phone = phone.substring(5);
        phone =  "233" + phone;
      }else  if(phone.startsWith('0233') && phone.length == 13)
      {
        phone = phone.substring(4);
        phone =  "233" + phone;
      }else if(phone.startsWith('+'))
      {
         phone = phone.substring(1);
      }
     
      phone = phone.replace(/ /g, '');
        return phone; 
     };





    ussd.formateUser = (userReg) => {

      delete userReg["id"];
      delete userReg["user_id"];
      delete userReg["password"];
      delete userReg["cloudinary_data"];
       
        return userReg; 
     };


    
module.exports = ussd
