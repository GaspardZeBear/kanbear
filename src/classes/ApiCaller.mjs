import axios from 'axios';
import { Kontext } from './Kontext.mjs';
import { sendEvent } from '../utils/sendEvent.mjs';

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
        this.headerArray = []
    }

    //-----------------------------------------------------------------
    async url(path) {
        let url = `${this.kanbearUrl}${path}`
        console.log("ApiCaller() url", url)
        return (url)
    }

    //-----------------------------------------------------------------
    header(parms) {
        this.headerArray = parms
        console.log("----> ApiCaller ", ...parms)
    }

    //-----------------------------------------------------------------
    async processError(error) {
        console.log("ApiCaller.processError() <headerArray>", ...this.headerArray)
        console.log("ApiCaller.processError() <error>", error.response.status, "<data>", error.response.data.code);
        let res = {
            error:true,
            status: error.response.status,
            data: error.response.data.code,
        }
        //throw error;

        console.log("ApiCaller.processError() <return>", res);
        sendEvent("error", { error: error.response.data.code })
        return(res)
    }

    //-----------------------------------------------------------------
    async get(uri, params = {}) {
        this.header(["GET", uri, { params }])
        console.log("url ", await this.url(uri), { params: params })
        try {
            const res = await axios.get(await this.url(uri), { params: params });
            console.log(res.status); // Status Code
            //console.log(res.data); // Response Data
            return (res)
        } catch (error) {
            let res = await this.processError(error)
            return (res)
        }
    }

    //------------------------------------------------------------------------------------
    async post(uri, body = {}) {
        this.header(["POST", uri, body])
        let res
        try {
            res = await axios.post(await this.url(uri), body);
            console.log(res.status); // Status Code
            //console.log(res.data); // Response Data
            //return (res)
        } catch (error) {
            res = await this.processError(error)
        } finally {
            console.log("ApiCaller.post() <res>",res); // Status Code
            return(res)
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
            let res = await this.processError(error)
            return (res)
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
            let res = await this.processError(error)
            return (res)
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
            let res = await this.processError(error)
            return (res)
        }
    }

}

export { ApiCaller }


