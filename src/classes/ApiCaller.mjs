import axios from 'axios';
import { Kontext } from './Kontext.mjs';

axios.defaults.timeout = 3000;
const apiUrl = 'http://A6.mshome.net:3002'

//-------------------------------------------------------------------------------------
class ApiCaller {

    constructor(url, apiToken = "dummyToken") {
        
        if (url === undefined) {
            this.kanbearUrl = Kontext.getKanbearUrl()
        } else {
            this.kanbearUrl = url
        }
        this.apiToken = apiToken;
        axios.defaults.headers.post['Authorization'] = apiToken;
    }

    //-----------------------------------------------------------------
    async url(path) {
        let url = `${this.kanbearUrl}${path}`
        console.log("ApiCaller() url", url)
        return (url)
    }

    //-----------------------------------------------------------------
    header(parms) {
        console.log("ApiCaller ", ...parms)
    }

    //-----------------------------------------------------------------
    async get(uri) {
        this.header(["GET", uri])
        console.log("url ", await this.url(uri))
        try {
            const res = await axios.get(await this.url(uri));
            console.log(res.status); // Status Code
            //console.log(res.data); // Response Data
            return (res)
        } catch (error) {
            console.error(`get() Error when calling  `, error.res?.data || error.message);
            //throw error;
        }
    }

    //------------------------------------------------------------------------------------
    async post(uri, body = {}) {
        this.header(["POST", uri, body])
        try {
            const res = await axios.post(await this.url(uri), body);
            console.log(res.status); // Status Code
            //console.log(res.data); // Response Data
            return (res)
        } catch (error) {
            console.error(`post() Error when calling  `, error.res?.data || error.message);
            throw error;
        }
    }


    //------------------------------------------------------------------------------------
    async put(uri, body = {}) {
        this.header(["PUT", uri, body])
        try {
            const res = await axios.put(await url(this.uri), body);
            console.log(res.status); // Status Code
            //console.log(res.data); // Response Data
            return (res)
        } catch (error) {
            console.error(`put() Error when calling  `, error.res?.data || error.message);
            //throw error;
        }
    }

    //------------------------------------------------------------------------------------
    async patch(uri, body = {}) {
        this.header(["PATCH", uri, body])
        try {
            const res = await axios.patch(await this.url(uri), body);
            console.log(res.status); // Status Code
            //console.log(res.data); // Response Data
            return (res)
        } catch (error) {
            console.error(`patch() Error when calling  `, error.res?.data || error.message);
            //throw error;
        }
    }

    //------------------------------------------------------------------------------------
    async erase(uri) {
        this.header(["DELETE", uri])
        try {
            const res = await axios.delete(await this.url(uri));
            console.log(res.status); // Status Code
            //console.log(res.data); // Response Data
            return (res)
        } catch (error) {
            console.error(`erase() Error when calling  `, error.res?.data || error.message);
            //throw error;
        }
    }

}

export { ApiCaller }


