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
        //let myError = {
        //    error:true,
        //    status: error.response.status,
        //    data: error.response.data.code,
        //}
        //console.log("ApiCaller <myError>",myError)
        let error0=new Error("ApicallerError()",{cause: {"status":error.response.status,"msg":error.response.data.code}})
        throw error0;
    }

    //-----------------------------------------------------------------
    async get(uri, params = {}) {
        this.header(["GET", uri, { params }])
        console.log("url ", await this.url(uri), { params: params })
        try {
            console.log("ApiCaller.get() before");
            const res = await axios.get(await this.url(uri), { params: params });
            console.log("ApiCaller.get() <res.status>",res.status); // Status Code
            return (res)
        } catch (error) {
            const res = await this.processError(error)
        }
    }

    //------------------------------------------------------------------------------------
    async post(uri, body = {}) {
        this.header(["POST", uri, body])
          try {
            console.log("ApiCaller.post() before");
            let res = await axios.post(await this.url(uri), body);
            console.log("ApiCaller.post() <res.status>",res.status); // Status Code
            //console.log(res.data); // Response Data
            return (res)
        } catch (error) {
            const res = await this.processError(error)
        } 
    }


    //------------------------------------------------------------------------------------
    async put(uri, body = {}) {
        this.header(["PUT", uri, body])
        try {
            console.log("ApiCaller.put() before");
            const res = await axios.put(await url(this.uri), body);
            console.log("ApiCaller.put() <res.status>",res.status); // Status Code
            //console.log(res.data); // Response Data
            return (res)
        } catch (error) {
            const res = await this.processError(error)
        }
    }

    //------------------------------------------------------------------------------------
    async patch(uri, body = {}) {
        this.header(["PATCH", uri, body])
        try {
            console.log("ApiCaller.patch() before");
            const res = await axios.patch(await this.url(uri), body);
            console.log("ApiCaller.patch() <res.status>",res.status); // Status Code
            //console.log(res.data); // Response Data
            return (res)
        } catch (error) {
            const res = await this.processError(error)
        }
    }

    //------------------------------------------------------------------------------------
    async erase(uri) {
        this.header(["DELETE", uri])
        try {
            console.log("ApiCaller.erase() before"); // Status Code
            const res = await axios.delete(await this.url(uri));
            console.log("ApiCaller.erase() <res.status>",res.status); // Status Code
            //console.log(res.data); // Response Data
            return (res)
        } catch (error) {
            const res = await this.processError(error)
        }
    }

}

export { ApiCaller }


