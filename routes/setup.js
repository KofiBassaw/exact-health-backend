const express = require("express");
const router = express.Router();

//TEST CONTROLLER
const {
   TestController
} = require("../controllers/api");



 

//test routes link
router.route("/testapi").get(TestController);





module.exports = router;