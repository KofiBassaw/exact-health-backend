
let myVars = {
    INITIATION :"INITIATION",
    EXISTING:"EXISTING",
    CLEANUP:"CLEANUP",
    UNKOWN_ERROR:"UNKOWN ERROR",
    UNABLETOPROCESSREQUEST : "unable to process request, please try again",
    REQUESTDONE : "request done",
    INVALID: "invalid request",
    APPLICATION_NAME: "Exact Health"
}

let ProcessStatus = {
    PENDING :0,
    COMPLETED:1,
    VERIFIED: 2,
    FAILED:10,
    BLOCKED :10,
    CANCELLED: 4,
    DEACTIVATE: 100,
    REVERSED: 55,
    PROCESSING: 32

}

let staticString = {
  TITLE : "Collabo",
  BASEURL : "http://localhost:9003/ussd/api/v1/"
}

let ActivityType = {
    STATIC : "STATIC",
    DYNAMIC : "DYNAMIC"
}


let ACTIVITYIDS = {
    CONTRIBUTIONAMOUNT : "e1dca8ee-b7f3-4a19-8fc9-53a128aee40a",
    CONTRIBUTION_DESTINATION_TYPE: "1d6c3ed2-368f-4232-80be-3ff7956b0f39"
}

let RESPONSE_CODES = {
    FAILED :0,
    SUCCESS:1,
    SESSION_EXPIRED:10,
    INVALID_REQUEST: 100
}




module.exports = {
    myVars,
    ProcessStatus,
    staticString,
    ActivityType,
    ACTIVITYIDS,
    RESPONSE_CODES
}
