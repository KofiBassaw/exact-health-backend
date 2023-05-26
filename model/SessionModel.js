
const {pool} = require("../config/db");
const { prepareColumns } = require("../helper/globals");
const { logger } = require("../logs/winston");

let ussd = {};
ussd.Create = (session, latitude, longitude) => {

    let columns = Object.keys(session)
    let params = Object.values(session)
    let fields = columns.toString()
    let values = prepareColumns(columns)
    let cordLong = '$'+(columns.length + 1);
    let cordLat = '$'+(columns.length + 2);
    params.push(longitude);
    params.push(latitude)
    let query = `INSERT INTO user_session(${fields},cordinates) VALUES (${values},ST_SetSRID(ST_MakePoint(${cordLong}, ${cordLat}), 4326)) RETURNING *`
    console.log(query);
    return new Promise((resolve, reject) => {
        pool.query(query, params, (err, results) => {
                if (err) {
                    logger.error(err);
                    return reject(err);
                }

                return resolve(results);
            });
    });
};



ussd.activeSession = (sessionID) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM user_session WHERE session_id = $1 AND  (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - last_updated)) / 60) <= $2 AND status = $3`, [sessionID,30,1], (err, results) => {
            if (err) {
                logger.error(err);
                return reject(err);
            }

            return resolve(results);
        });
    });
};




module.exports = ussd


