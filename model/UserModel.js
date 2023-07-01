//const {pool,pgp,db}= require("../config/db");
const { logger } = require("../logs/winston");
const {pool,pgp,db}= require("../config/db");


let ussd = {};

ussd.details = (userID) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM user_profile WHERE user_id = $1 AND status = $2`, [userID,1], (err, results) => {
            if (err) {
                logger.error(err);
                return reject(err);
            }

            return resolve(results);
        });
    });
};


ussd.login = (emailOrPhone, password) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM user_profile where (phone_number = $1 or email = $2) and password = $3 and status = $4`, [emailOrPhone,emailOrPhone,password,1], (err, results) => {
            if (err) {
                logger.error(err);
                return reject(err);
            }

            return resolve(results);
        });
    });
};


ussd.activePersonalData = (userID) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM user_personal_data WHERE user_id = $1 AND status = $2`, [userID,1], (err, results) => {
            if (err) {
                logger.error(err);
                return reject(err);
            }

            return resolve(results);
        });
    });
};




ussd.activeEducationList = (userID) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM user_education WHERE user_id = $1 AND status = $2`, [userID,1], (err, results) => {
            if (err) {
                logger.error(err);
                return reject(err);
            }

            return resolve(results);
        });
    });
};




ussd.activeEmploymentList = (userID) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM user_employment_history WHERE user_id = $1 AND status = $2`, [userID,1], (err, results) => {
            if (err) {
                logger.error(err);
                return reject(err);
            }

            return resolve(results);
        });
    });
};





ussd.activeReferenceList = (userID) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM user_reference WHERE user_id = $1 AND status = $2`, [userID,1], (err, results) => {
            if (err) {
                logger.error(err);
                return reject(err);
            }

            return resolve(results);
        });
    });
};




ussd.currentClockIn = (userID) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM user_clock_in_history where DATE(date_added) = DATE(CURRENT_TIMESTAMP) AND user_id = $1`, [userID], (err, results) => {
            if (err) {
                logger.error(err);
                return reject(err);
            }

            return resolve(results);
        });
    });
};





ussd.bulkAddUserSchedules = async (schedules, userID) => {
    
    const updatedSchedules = schedules.map(item => {
        return { ...item, user_id: userID };
      });

      try {
        const query = pgp.helpers.insert(updatedSchedules, ['date_start', 'date_end','user_id','recurring'], 'user_schedule') + ' RETURNING *';
        const result = await  db.query(query);
        console.log('Bulk insert successful');
        console.log('Inserted rows:', result);
        return  result;
      } catch (error) {
        logger.error(error);
        console.error('Error performing bulk insert', error);
        return [];
      } finally {
        //pgp.end();
      }
};




ussd.schedules = (userID) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT id, schedule_id, date_start, date_end, user_id, status, date_added, recurring, day_of_the_week
        FROM  user_schedule
        where date_end >= CURRENT_TIMESTAMP and user_id = $1 and status = $2`, [userID,1], (err, results) => {
            if (err) {
                logger.error(err);
                return reject(err);
            }

            return resolve(results);
        });
    });
};





module.exports = ussd