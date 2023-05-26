const express = require("express");
const upload = require("../middleware/fileMiddleware")
const router = express.Router();

//TEST CONTROLLER
const {
   TestController
} = require("../controllers/api");

const {
   RegisterInitiateController,
   RegisterConfirmOtpController,
   UserProfessionController,
   UserPersonalDataController ,
   UserEducationDataController,
   EmploymentController,
   ReferenceDataController,
   ApplicationDataController,
   LoginController,
   CompleteUserApplicationSeetUpControler,
   UpdateProfileControler,
   UploadProfieleImage
} = require("../controllers/userController");

const { CheckAgent } = require("../middleware/requestMiddleware");
const { CheckLoginAgent } = require("../middleware/loginMiddleware");



//test routes link
router.route("/testapi").get(CheckAgent,TestController);


//user functions
router.route("/user/initiateRegistration").post(RegisterInitiateController);
router.route("/user/confirmOtp").post(RegisterConfirmOtpController);
router.route("/user/profession").get(CheckAgent,UserProfessionController);
router.route("/user/personal-data").post(CheckAgent,UserPersonalDataController);
router.route("/user/education-data").post(CheckAgent,UserEducationDataController);
router.route("/user/employment").post(CheckAgent,EmploymentController);
router.route("/user/refrence").post(CheckAgent,ReferenceDataController);
router.route("/user/application-data").get(CheckAgent,ApplicationDataController);
router.route("/user/login").post(CheckLoginAgent,LoginController);
router.route("/user/complete-setup").post(CheckAgent,CompleteUserApplicationSeetUpControler);
router.route("/user/update-profile").post(CheckAgent,UpdateProfileControler);
router.route("/user/upload-image").post(CheckAgent,upload.single('file'),UploadProfieleImage);





//


module.exports = router;