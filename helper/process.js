module.exports = {
    processResponse: (response) => {
        if (response.data) {
            return ({ error: null, data: response.data });
        }
        else if (response.error) {
            return ({ error: true, data: { name: 'fetcherror', type: 'error', message: response.error.data } });
        }
        else {
            return ({ error: true, data: { name: 'fetcherror', type: 'error', title: 'Request Error', message: 'request failed', } });
        }

    },


}