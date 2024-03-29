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
   UploadProfieleImage,
   ReturnToApplicationControler,
   UserProfileControler,
   Schedules
} = require("../controllers/userController");





const {
   AdminLoginController,
   UserAdminAll,
   UserAdminPendingReview,
   AdminApplicationDataController,
   AdminUserReviewController
} = require("../controllersAdmin/userController");




const {
   AppointmentCurrentAppointmentController,
   AppointmentAddDiagnosisController,
   AppointmentRecordsController,
   AppointmentLabParamtersController,
   AppointmentLabRequestController,
   AppointmentAddPrescriptionController,
   AppointmentAddTaskController,
   AppointmentAddTaskActivityController,
   AppointmentUpcomingController,
   AppointmentAddReferralController
} = require("../controllers/appointmentController");





const { CheckAgent } = require("../middleware/requestMiddleware");
const { CheckLoginAgent } = require("../middleware/loginMiddleware");



//test routes link
router.route("/testapi").get(CheckAgent,TestController);


//admin user functions
router.route("/admin/user/login").post(CheckLoginAgent,AdminLoginController);
router.route("/admin/user/all").get(CheckAgent,UserAdminAll);
router.route("/admin/user/pendingReview").get(CheckAgent,UserAdminPendingReview);
router.route("/admin/user/application-data/:user_id").get(CheckAgent,AdminApplicationDataController);
router.route("/admin/user/review").post(CheckAgent,AdminUserReviewController);





//user functions
router.route("/user/initiateRegistration").post(RegisterInitiateController);
router.route("/user/confirmOtp").post(RegisterConfirmOtpController);
router.route("/user/profession").get(UserProfessionController);
router.route("/user/personal-data").post(CheckAgent,UserPersonalDataController);
router.route("/user/education-data").post(CheckAgent,UserEducationDataController);
router.route("/user/employment").post(CheckAgent,EmploymentController);
router.route("/user/refrence").post(CheckAgent,ReferenceDataController);
router.route("/user/application-data").get(CheckAgent,ApplicationDataController);
router.route("/user/login").post(CheckLoginAgent,LoginController);
router.route("/user/complete-setup").get(CheckAgent,CompleteUserApplicationSeetUpControler);
router.route("/user/update-profile").post(CheckAgent,UpdateProfileControler);
router.route("/user/upload-image").post(CheckAgent,upload.single('file'),UploadProfieleImage);
router.route("/user/return-application").get(CheckAgent,ReturnToApplicationControler);
router.route("/user/profile").get(CheckAgent,UserProfileControler);
router.route("/user/schedules").get(CheckAgent,Schedules);





//appointment functions
router.route("/appointment/current").get(CheckAgent,AppointmentCurrentAppointmentController);
router.route("/appointment/upcoming").get(CheckAgent,AppointmentUpcomingController);
router.route("/appointment/diagnosis").post(CheckAgent,AppointmentAddDiagnosisController);
router.route("/appointment/records/:appointment_id").get(CheckAgent,AppointmentRecordsController);
router.route("/appointment/lab-paramters").get(CheckAgent,AppointmentLabParamtersController);
router.route("/appointment/lab-order").post(CheckAgent,AppointmentLabRequestController);
router.route("/appointment/medication").post(CheckAgent,AppointmentAddPrescriptionController);
router.route("/appointment/task").post(CheckAgent,AppointmentAddTaskController);
router.route("/appointment/task-activity").post(CheckAgent,AppointmentAddTaskActivityController);
router.route("/appointment/referral").post(CheckAgent,AppointmentAddReferralController);





module.exports = router;