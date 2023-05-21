const express = require("express");
const router = express.Router();

//TEST CONTROLLER
const {
   TestController
} = require("../controllers/api");

const {
   RegisterInitiateController,
   RegisterConfirmOtpController
} = require("../controllers/userController");

const { CheckAgent } = require("../middleware/loginMiddleware");



 

//test routes link
router.route("/testapi").get(CheckAgent,TestController);


//user functions
router.route("/user/initiateRegistration").post(RegisterInitiateController);
router.route("/user/confirmOtp").post(RegisterConfirmOtpController);





module.exports = router;