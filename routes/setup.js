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
   ReturnToApplicationControler
} = require("../controllers/userController");


const {
   AppointmentCurrentAppointmentController,
   AppointmentAddDiagnosisController,
   AppointmentRecordsController,
   AppointmentLabParamtersController,
   AppointmentLabRequestController,
   AppointmentAddPrescriptionController,
   AppointmentAddTaskController,
   AppointmentAddTaskActivityController,
   AppointmentUpcomingController
} = require("../controllers/appointmentController");





const { CheckAgent } = require("../middleware/requestMiddleware");
const { CheckLoginAgent } = require("../middleware/loginMiddleware");



//test routes link
router.route("/testapi").get(CheckAgent,TestController);


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






module.exports = router;