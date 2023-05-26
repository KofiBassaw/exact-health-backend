const {pool} = require("../config/db");
const { prepareColumns } = require("../helper/globals");
const { logger } = require("../logs/winston");

let ussd = {};

ussd.ValidateDynamicValue = (variable,value) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT ${variable} FROM tenants WHERE ${variable} = $1`,[value], (err, results) => {
            if (err) {
                logger.error(err);
                return reject(err);
            }

            return resolve(results);
        });
    });
};

ussd.Find = (variable, value,table) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM ${table} WHERE ${variable} = $1`, [value], (err, results) => {
            if (err) {
                logger.error(err);
                return reject(err);
            }

            return resolve(results);
        });
    });
};

ussd.Create = (payload,table,returnfield) => {
    let columns = Object.keys(payload)
    let params = Object.values(payload)
    let fields = columns.toString()
    let values = prepareColumns(columns)
    let query = `INSERT INTO ${table} (${fields}) VALUES (${values}) RETURNING *`
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




ussd.Update = (values,table, fieldname,fiedlvalue) => {
    let columns = Object.keys(values);
    let params = [fiedlvalue];
    let query = `UPDATE ${table} SET `;
    for (let i = 0; i < columns.length; i++) {
        query = `${query}${columns[i]} = $${params.length + 1},`
        params.push(values[columns[i]]);
    }
    query = `${query.substring(0, query.length - 1)} WHERE ${fieldname} = $1 RETURNING *`
    
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

module.exports = ussd