const {pool,pgp,db}= require("../config/db");
const { logger } = require("../logs/winston");


let ussd = {};

ussd.currentAppointement = (professional_id) => {
    return new Promise((resolve, reject) => {

      
     const query = 'select ap.*, up.depandent_id as patient_id, up.name as patient_name, up.phone_number as patient_phone_number, '+
        ' up.email as patient_email, up.underlining_condition as patient_bio, up.profile_url as patient_url, aType.title as appointment_type from ' +
     ' appointment ap join user_dependant up on ap.patient_id = up.depandent_id ' +
     ' join appoitment_type aType on ap.appointment_type_id = aType.appointment_type_id '+
     ' where ap.medical_professional_id = $1 and DATE(appointment_date) = DATE(CURRENT_TIMESTAMP)';

// Execute the query with the provided query parameters
db.any(query, [professional_id])
  .then(data => {
    // Handle the query results
    console.log(data);
    return resolve(data);
  })
  .catch(error => {
    // Handle any errors
    console.error(error);
    return reject(error);
  });

    });
};




ussd.upcomingAppointement = (professional_id) => {
  return new Promise((resolve, reject) => {

    
   const query = 'select ap.*, up.depandent_id as patient_id, up.name as patient_name, up.phone_number as patient_phone_number, '+
      ' up.email as patient_email, up.underlining_condition as patient_bio, up.profile_url as patient_url, aType.title as appointment_type from ' +
   ' appointment ap join user_dependant up on ap.patient_id = up.depandent_id ' +
   ' join appoitment_type aType on ap.appointment_type_id = aType.appointment_type_id '+
   ' where ap.medical_professional_id = $1 and DATE(appointment_date) > DATE(CURRENT_TIMESTAMP)';

// Execute the query with the provided query parameters
db.any(query, [professional_id])
.then(data => {
  // Handle the query results
  console.log(data);
  return resolve(data);
})
.catch(error => {
  // Handle any errors
  console.error(error);
  return reject(error);
});

  });
};



ussd.diagnosis = (appointment_id) => {
  return new Promise((resolve, reject) => {

    
   const query = 'SELECT * FROM appointment_diagnoses where appointment_id = $1 AND status = $2';

// Execute the query with the provided query parameters
db.any(query, [appointment_id, 1])
.then(data => {
  // Handle the query results
  console.log(data);
  return resolve(data);
})
.catch(error => {
  // Handle any errors
  console.error(error);
  return reject(error);
});

  });
};



ussd.medications = (appointment_id) => {
  return new Promise((resolve, reject) => {

    
   const query = 'SELECT * FROM appointment_medication where appointment_id = $1 AND status = $2';

// Execute the query with the provided query parameters
db.any(query, [appointment_id, 1])
.then(data => {
  // Handle the query results
  console.log(data);
  return resolve(data);
})
.catch(error => {
  // Handle any errors
  console.error(error);
  return reject(error);
});

  });
};


ussd.labOrders = (appointment_id) => {
  return new Promise((resolve, reject) => {

    const query = 'SELECT * FROM appointment_lab_order WHERE  appointment_id = $1 and status = $2';
      db.any(query,  [appointment_id, 1]).then(orders => {
      // Handle the query results
      const usersWithPosts =  Promise.all(
        orders.map(async (order) => {
          const parameters = await db.any('SELECT * FROM appointment_lab_order_parameter WHERE lab_order_id = $1', order.lab_order_id);
          return { ...order, parameters };
        })
      );
      

      console.log(usersWithPosts);
      return resolve(usersWithPosts);
    })
    .catch(error => {
      // Handle any errors
      console.error(error);
      return reject(error);
    });



  });
};



ussd.tasks = (appointment_id) => {
  return new Promise((resolve, reject) => {

    const query = 'SELECT apt.*, up.name as medical_professional_name, up.profile_url as medical_professional_profile_url  FROM appointment_task  apt   JOIN user_profile  up ON apt.medical_professional_id = up.user_id  WHERE  appointment_id = $1 and (apt.status = $2 or apt.status = $3)';
      db.any(query,  [appointment_id, 1,2]).then(orders => {
      // Handle the query results
      const usersWithPosts =  Promise.all(
        orders.map(async (task) => {
          const activities = await db.any('SELECT apta.*, up.name as medical_professional_name, up.profile_url as medical_professional_profile_url FROM appointment_task_activity apta JOIN user_profile  up ON apta.medical_professional_id = up.user_id WHERE apta.task_id = $1', task.task_id);
          return { ...task, activities };
        })
      );
      

      console.log(usersWithPosts);
      return resolve(usersWithPosts);
    })
    .catch(error => {
      // Handle any errors
      console.error(error);
      return reject(error);
    });



  });
};






ussd.addBulkLabParamter = async (labParameter) => {
    
    try {
      const query = pgp.helpers.insert(labParameter, ['lab_order_id', 'appointment_id','patient_id','medical_professional_id','title','description','lab_parameter_id','user_id'], 'appointment_lab_order_parameter') + ' RETURNING *';
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




ussd.referrals = (appointment_id) => {
  return new Promise((resolve, reject) => {

    
   const query = 'SELECT ar.*, bs.name as service_name FROM appointment_referral ar left join business_branch_services bs  on ar.facility_id = bs.services_id where ar.status = $1 and ar.appointment_id = $2';

// Execute the query with the provided query parameters
db.any(query, [1, appointment_id])
.then(data => {
  // Handle the query results
  console.log(data);
  return resolve(data);
})
.catch(error => {
  // Handle any errors
  console.error(error);
  return reject(error);
});

  });
};





module.exports = ussd