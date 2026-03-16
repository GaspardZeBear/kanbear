import axios from 'axios';

axios.defaults.timeout = 3000;
const apiUrl = 'http://A6.mshome.net:3002'

//-------------------------------------------------------------------------------------
class ApiCaller {

    //-----------------------------------------------------------------
    async url(path) {
        return (`${apiUrl}${path}`)
    }

    //-----------------------------------------------------------------
    async header(parms) {
        console.log("---", ...parms)
    }

    //-----------------------------------------------------------------
    async get(uri) {
        header(["GET", uri])
        try {
            const res = await axios.get(this.url(uri));
            console.log(res.status); // Status Code
            console.log(res.data); // Response Data
            return (res)
        } catch (error) {
            console.error(`post() Error when calling  `, error.res?.data || error.message);
            //throw error;
        }
    }

    //------------------------------------------------------------------------------------
    async post(uri, body = {}) {
        header(["POST", uri, body])
        try {
            const res = await axios.post(this.url(uri), body);
            console.log(res.status); // Status Code
            console.log(res.data); // Response Data
            return (res)
        } catch (error) {
            console.error(`post() Error when calling  `, error.res?.data || error.message);
            //throw error;
        }
    }


    //------------------------------------------------------------------------------------
    async put(uri, body = {}) {
        header(["PUT", uri, body])
        try {
            const res = await axios.put(url(this.uri), body);
            console.log(res.status); // Status Code
            console.log(res.data); // Response Data
            return (res)
        } catch (error) {
            console.error(`post() Error when calling  `, error.res?.data || error.message);
            //throw error;
        }
    }

    //------------------------------------------------------------------------------------
    async patch(uri, body = {}) {
        header(["PATCH", uri, body])
        try {
            const res = await axios.patch(this.url(uri), body);
            console.log(res.status); // Status Code
            console.log(res.data); // Response Data
            return (res)
        } catch (error) {
            console.error(`post() Error when calling  `, error.res?.data || error.message);
            //throw error;
        }
    }

    //------------------------------------------------------------------------------------
    async erase(uri) {
        header(["DELETE", uri])
        try {
            const res = await axios.delete(this.url(uri));
            console.log(res.status); // Status Code
            console.log(res.data); // Response Data
            return (res)
        } catch (error) {
            console.error(`post() Error when calling  `, error.res?.data || error.message);
            //throw error;
        }
    }

}

export { ApiCaller }


