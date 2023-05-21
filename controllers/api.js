const asynHandler = require("../middleware/async");
exports.TestController = asynHandler(async (req, res, next) => {
    console.log(req.newvalue);
    res.send("hello Gyanima" )
    })