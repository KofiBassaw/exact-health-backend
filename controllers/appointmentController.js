const asynHandler = require("../middleware/async");
const GlobalModel = require("../model/GlobalModel");
const DeviceModel = require("../model/DeviceModel");
const UtilityModel = require("../model/UtitlityModel")
const SessionModel = require("../model/SessionModel")
const UserModel = require("../model/UserModel")
const UtilityHelper = require("../helper/utilfunc");
const AppointmentModel = require("../model/AppointmentModel")
const { RESPONSE_CODES,TASK_STATUS } = require("../helper/vars");
const { logger } = require("../logs/winston");
const { sendSMS } = require("../helper/autoRunner");
const cloudinary = require("../config/cloudinary");
const fs = require('fs');



exports.AppointmentCurrentAppointmentController = asynHandler(async (req, res, next) => {

    let {session,user} = req;
    
    console.log(session);

    let professionResp = await AppointmentModel.currentAppointement(user.user_id)


   var resp = {
       status : RESPONSE_CODES.SUCCESS,
       message : "Success",
       data : professionResp
   };

   return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)

})







exports.AppointmentUpcomingController = asynHandler(async (req, res, next) => {

    let {session,user} = req;
    
    console.log(session);

    let professionResp = await AppointmentModel.upcomingAppointement(user.user_id)


   var resp = {
       status : RESPONSE_CODES.SUCCESS,
       message : "Success",
       data : professionResp
   };

   return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)

})





exports.AppointmentLabParamtersController = asynHandler(async (req, res, next) => {

    let {session,user} = req;
    
    console.log(session);

    let professionResp = await GlobalModel.Find('status',1,'lab_parameter')


   var resp = {
       status : RESPONSE_CODES.SUCCESS,
       message : "Success",
       data : professionResp.rows
   };

   return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)

})




exports.AppointmentAddDiagnosisController = asynHandler(async (req, res, next) => {

    let {session,user} = req;
    let diagnosis  = req.body;
    
    let professionResp = await GlobalModel.Find('appointment_id',diagnosis.appointment_id,'appointment')

    if(professionResp.rows <= 0)
    {
        var resp = {
            status : RESPONSE_CODES.FAILED,
            message : "Invalid appointment ID"
        };
    
        return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)
    }

    let appointment = professionResp.rows[0];
    var SavedDiagnoses = null;



    if(diagnosis.diagnosis_id)
    {
        //update the diagnosis details
        let diagnosis_id = diagnosis.diagnosis_id;
        delete diagnosis['diagnosis_id'];


        let updateResp = await GlobalModel.Update(diagnosis,'appointment_diagnoses','diagnosis_id',diagnosis_id);


        if(updateResp.rowCount < 1)
        {
            //failed to update user details
            var resp = {
                status : RESPONSE_CODES.FAILED,
                message : "Unable to update diagnosis details"
            };
            return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)
        }

        SavedDiagnoses = updateResp.rows[0];
    }else{
        //new diagnosis add
        diagnosis.patient_id = appointment.patient_id;
        diagnosis.medical_professional_id = user.user_id;
        diagnosis.user_id = appointment.user_id;

        let newPersResponse = await GlobalModel.Create(diagnosis,'appointment_diagnoses','');

        if(newPersResponse.rowCount < 1)
        {
            //request failed to save
        var resp = {
            status : RESPONSE_CODES.FAILED,
            message : "Unable to save diagnosis details"
        };
    
        return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)
        }
    
        SavedDiagnoses = newPersResponse.rows[0];

    }



   

   var resp = {
       status : RESPONSE_CODES.SUCCESS,
       message : "Success",
       data : SavedDiagnoses
   };
   

   return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)

})








exports.AppointmentLabRequestController = asynHandler(async (req, res, next) => {

    let {session,user} = req;
    let labOrder  = req.body;

    



    let professionResp = await GlobalModel.Find('appointment_id',labOrder.appointment_id,'appointment')

    if( professionResp.rows <= 0)
    {
        var resp = {
            status : RESPONSE_CODES.FAILED,
            message : "Invalid appointment ID"
        };
    
        return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)
    }


    let appointment = professionResp.rows[0];
    var SavedLabOrder = null;
    let {parameters} = labOrder;
    delete labOrder['parameters'];





    if(labOrder.lab_order_id)
    {
        //update the diagnosis details
        let lab_order_id = labOrder.lab_order_id;
        delete labOrder['lab_order_id'];


        let updateResp = await GlobalModel.Update(labOrder,'appointment_lab_order','lab_order_id',diagnosis_id);


        if(updateResp.rowCount < 1)
        {
            //failed to update user details
            var resp = {
                status : RESPONSE_CODES.FAILED,
                message : "Unable to update lab order details"
            };
            return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)
        }

        SavedLabOrder = updateResp.rows[0];
    }else{
        //new diagnosis add
        labOrder.patient_id = appointment.patient_id;
        labOrder.medical_professional_id = user.user_id;
        labOrder.user_id = appointment.user_id;

        let newPersResponse = await GlobalModel.Create(labOrder,'appointment_lab_order','');

        if(newPersResponse.rowCount < 1)
        {
            //request failed to save
        var resp = {
            status : RESPONSE_CODES.FAILED,
            message : "Unable to save lab order details"
        };
    
        return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)
        }
        SavedLabOrder = newPersResponse.rows[0];
    }


    

    console.log("coming to print saved Parameters")
    const savedParameters = parameters.map(item => {
        return { ...item, 
            lab_order_id: SavedLabOrder.lab_order_id,  
            patient_id: appointment.patient_id,
            medical_professional_id: user.user_id,
            user_id: appointment.user_id,
            appointment_id: SavedLabOrder.appointment_id

        };
      });

   
       console.log(savedParameters)

      let bulkParam = await AppointmentModel.addBulkLabParamter(savedParameters);

      var reqResponse = {
       ...SavedLabOrder,
       paramters: bulkParam
      };

   var resp = {
       status : RESPONSE_CODES.SUCCESS,
       message : "Success",
       data : reqResponse
   };
   

   return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)

})










exports.AppointmentAddPrescriptionController = asynHandler(async (req, res, next) => {

    let {session,user} = req;
    let medication  = req.body;
    
    let professionResp = await GlobalModel.Find('appointment_id',medication.appointment_id,'appointment')

    if( professionResp.rows <= 0)
    {
        var resp = {
            status : RESPONSE_CODES.FAILED,
            message : "Invalid appointment ID"
        };
    
        return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)
    }

    let appointment = professionResp.rows[0];
    var SavedMedication = null;



    if(medication.medication_id)
    {
        //update the diagnosis details
        let medication_id = medication.medication_id;
        delete medication['medication_id'];


        let updateResp = await GlobalModel.Update(medication,'appointment_medication','medication_id',medication_id);


        if(updateResp.rowCount < 1)
        {
            //failed to update user details
            var resp = {
                status : RESPONSE_CODES.FAILED,
                message : "Unable to update medication details"
            };
            return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)
        }

        SavedMedication = updateResp.rows[0];
    }else{
        //new diagnosis add
        medication.patient_id = appointment.patient_id;
        medication.medical_professional_id = user.user_id;
        medication.user_id = appointment.user_id;

        let newPersResponse = await GlobalModel.Create(medication,'appointment_medication','');

        if(newPersResponse.rowCount < 1)
        {
            //request failed to save
        var resp = {
            status : RESPONSE_CODES.FAILED,
            message : "Unable to save medication details"
        };
    
        return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)
        }
    
        SavedMedication = newPersResponse.rows[0];

    }



   

   var resp = {
       status : RESPONSE_CODES.SUCCESS,
       message : "Success",
       data : SavedMedication
   };
   

   return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)

})









exports.AppointmentAddTaskController = asynHandler(async (req, res, next) => {

    let {session,user} = req;
    let task  = req.body;
    
    let professionResp = await GlobalModel.Find('appointment_id',task.appointment_id,'appointment')

    if( professionResp.rows <= 0)
    {
        var resp = {
            status : RESPONSE_CODES.FAILED,
            message : "Invalid appointment ID"
        };
    
        return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)
    }

    let appointment = professionResp.rows[0];
    var SavedTask = null;



    if(task.task_id)
    {
        //update the diagnosis details
        let task_id = task.task_id;
        delete task['task_id'];


        let updateResp = await GlobalModel.Update(task,'appointment_task','task_id',task_id);


        if(updateResp.rowCount < 1)
        {
            //failed to update user details
            var resp = {
                status : RESPONSE_CODES.FAILED,
                message : "Unable to update medication details"
            };
            return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)
        }

        SavedTask = updateResp.rows[0];
    }else{
        //new diagnosis add
        task.patient_id = appointment.patient_id;
        task.medical_professional_id = user.user_id;
        task.user_id = appointment.user_id;

        let newPersResponse = await GlobalModel.Create(task,'appointment_task','');

        if(newPersResponse.rowCount < 1)
        {
            //request failed to save
        var resp = {
            status : RESPONSE_CODES.FAILED,
            message : "Unable to save medication details"
        };
    
        return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)
        }
    
        SavedTask = newPersResponse.rows[0];

    }



   

   var resp = {
       status : RESPONSE_CODES.SUCCESS,
       message : "Success",
       data : SavedTask
   };
   

   return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)

})
















exports.AppointmentAddTaskActivityController = asynHandler(async (req, res, next) => {

    let {session,user} = req;
    let taskActivity  = req.body;
    
    let professionResp = await GlobalModel.Find('task_id',taskActivity.task_id,'appointment_task')

    if( professionResp.rows <= 0)
    {
        var resp = {
            status : RESPONSE_CODES.FAILED,
            message : "Invalid task ID"
        };
    
        return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)
    }

    let taskb = professionResp.rows[0];
    var SavedTaskActivity = null;
    let status = taskActivity.status;
    delete taskActivity['status'];



    if(taskActivity.activity_id)
    {
        //update the diagnosis details
        let activity_id = taskActivity.activity_id;
        delete taskActivity['activity_id'];


        let updateResp = await GlobalModel.Update(taskActivity,'appointment_task_activity','activity_id',activity_id);


        if(updateResp.rowCount < 1)
        {
            //failed to update user details
            var resp = {
                status : RESPONSE_CODES.FAILED,
                message : "Unable to update activity details"
            };
            return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)
        }

        SavedTaskActivity = updateResp.rows[0];
    }else{
        //new diagnosis add
        taskActivity.patient_id = taskb.patient_id;
        taskActivity.medical_professional_id = user.user_id;
        taskActivity.user_id = taskb.user_id;
        taskActivity.task_id = taskb.task_id;

        let newPersResponse = await GlobalModel.Create(taskActivity,'appointment_task_activity','');

        if(newPersResponse.rowCount < 1)
        {
            //request failed to save
        var resp = {
            status : RESPONSE_CODES.FAILED,
            message : "Unable to save activity details"
        };
    
        return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)
        }
    
        SavedTaskActivity = newPersResponse.rows[0];

    }



    if(status == TASK_STATUS.CLOSED)
    {

        var taskUpdateObj =  {
            status:  TASK_STATUS.CLOSED
        };

        let taskUpdate = await GlobalModel.Update(taskUpdateObj,'appointment_task','task_id',taskb.task_id);
    }
   

   var resp = {
       status : RESPONSE_CODES.SUCCESS,
       message : "Success",
       data : SavedTaskActivity
   };
   

   return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)

})











exports.AppointmentRecordsController = asynHandler(async (req, res, next) => {

    let {session,user,params} = req;
    console.log('paramter here')
    console.log(params);
    let {appointment_id} = params;
   
    console.log(appointment_id); 

    let diagnosisResp = await AppointmentModel.diagnosis(appointment_id);

    let labOders = await AppointmentModel.labOrders(appointment_id);

    let medications = await AppointmentModel.medications(appointment_id);

    let tasks = await AppointmentModel.tasks(appointment_id);


    

    var recData = {
        dignosis : diagnosisResp,
        labOders : labOders,
        medications: medications
    };

    console.log(recData)

   var resp = {
       status : RESPONSE_CODES.SUCCESS,
       message : "Success",
       data : recData,
       tasks: tasks
   };

   return UtilityHelper.sendResponse(res, 200, resp.message, resp,session)

})
