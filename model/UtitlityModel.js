const {pool} = require("../config/db");
const { logger } = require("../logs/winston");


let ussd = {};

ussd.passwordResetDetails =  (passwordCode,resetID) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM password_reset WHERE reset_id = $1 AND reset_password_code = $2 AND status = $3 AND (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - date_added)) / 60) <= $4 `, [resetID,passwordCode,1, 20], (err, results) => {
            if (err) {
                logger.error(err);
                return reject(err);
            }

            return resolve(results);
        });
    });
};

module.exports = ussd