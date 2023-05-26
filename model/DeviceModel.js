const {pool} = require("../config/db");
const { logger } = require("../logs/winston");


let ussd = {};

ussd.details = (imei, platform) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM user_device WHERE device_imei = $1 AND device_type = $2 AND status = $3`, [imei,platform,1], (err, results) => {
            if (err) {
                logger.error(err);
                return reject(err);
            }

            return resolve(results);
        });
    });
};



ussd.details = (imei, platform, user_id) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM user_device WHERE device_imei = $1 AND device_type = $2 AND status = $3 AND user_id = $4`, [imei,platform,1,user_id], (err, results) => {
            if (err) {
                logger.error(err);
                return reject(err);
            }

            return resolve(results);
        });
    });
};

module.exports = ussd