const pool = require("../config/db");
const { logger } = require("../logs/winston");


let ussd = {};

ussd.byBaseIDanddisplayNumber = (baseID,displayNumber) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM activity WHERE base_id = $1 AND display_number = $2 AND status = $3`, [baseID,displayNumber,1], (err, results) => {
            if (err) {
                logger.error(err);
                return reject(err);
            }

            return resolve(results);
        });
    });
};

module.exports = ussd