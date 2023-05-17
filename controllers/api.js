const asynHandler = require("../middleware/async");
exports.TestController = asynHandler(async (req, res, next) => {
    res.send("hello Gyanima" )
    })