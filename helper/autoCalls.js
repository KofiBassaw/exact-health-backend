const axios = require('axios')


const { processResponse } = require('./process');
module.exports = {
  ApiCall: async (url, method, auth, json,) => {

    try {
      const config = {
        method,
        url,
        credentials: 'include',
        data: JSON.stringify(json), //{s:'security',a:'basicdata'}
        headers: {
          'Content-Type': 'application/json', //TODO: Accept application/json
          'Authorization': `Bearer ${auth}`
        }
      };
      const resp = await axios(config);
      const { error, data } = processResponse(resp);
      if (error) return null;
      else return data;
    }
    catch (err) {
      console.log(err?.response)
      
      return null;
      //if api failed to connect  or any error

    }


  },


}