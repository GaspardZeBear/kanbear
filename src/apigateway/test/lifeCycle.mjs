import axios from 'axios';

axios.defaults.timeout = 3000;
const apiUrl = 'http://A6.mshome.net:3002'

//-----------------------------------------------------------------
function url(path) {
    return (`${apiUrl}${path}`)
}

//-----------------------------------------------------------------
function header(parms) {
    console.log("---", ...parms)
}

//-----------------------------------------------------------------
async function get(uri) {
    header(["GET", uri])
    try {
        const res = await axios.get(url(uri));
        console.log(res.status); // Status Code
        console.log(res.data); // Response Data
        return (res)
    } catch (error) {
        console.error(`post() Error when calling  `, error.res?.data || error.message);
        //throw error;
    }
}

//------------------------------------------------------------------------------------
async function post(uri, body = {}) {
    header(["POST", uri, body])
    try {
        const res = await axios.post(url(uri), body);
        console.log(res.status); // Status Code
        console.log(res.data); // Response Data
        return (res)
    } catch (error) {
        console.error(`post() Error when calling  `, error.res?.data || error.message);
        //throw error;
    }
}


//------------------------------------------------------------------------------------
async function put(uri, body = {}) {
    header(["PUT", uri, body])
    try {
        const res = await axios.put(url(uri), body);
        console.log(res.status); // Status Code
        console.log(res.data); // Response Data
        return (res)
    } catch (error) {
        console.error(`post() Error when calling  `, error.res?.data || error.message);
        //throw error;
    }
}

//------------------------------------------------------------------------------------
async function patch(uri, body = {}) {
    header(["PATCH", uri, body])
    try {
        const res = await axios.patch(url(uri), body);
        console.log(res.status); // Status Code
        console.log(res.data); // Response Data
        return (res)
    } catch (error) {
        console.error(`post() Error when calling  `, error.res?.data || error.message);
        //throw error;
    }
}

//------------------------------------------------------------------------------------
async function erase(uri) {
    header(["DELETE", uri])
    try {
        const res = await axios.delete(url(uri));
        console.log(res.status); // Status Code
        console.log(res.data); // Response Data
        return (res)
    } catch (error) {
        console.error(`post() Error when calling  `, error.res?.data || error.message);
        //throw error;
    }
}

//-------------------------------------------------------------------------------------
class Entity {

    constructor(table) {
        this.table=table
        this.api=`/api/${this.table}`
        this.id=0
        this.name=''
    }

    //-----------------------------------------------------
    async list() {
        let counter
        let res = await get(this.api)
    }

    //-----------------------------------------------------
    async getId() {
        return(this.id) 
    }

    //-----------------------------------------------------
    async create() {
        let counter
        let res = await get(this.api)
        counter = res.data.length
        this.name = this.table + "#" + counter
        res = await post(this.api, { name: this.name })
        //console.log(res.data)
        this.id = res.data["lastInsertRowid"]
    }

    //------------------------------------------------
    async alter() {
        let newName = this.name + '++'
        let res = await patch(`${this.api}/${this.id}`, { "name": newName })
        await get(`${this.api}/${this.id}`)

    }

    //---------------------------------------------------------
    async erase() {
        await erase(`${this.api}/${this.id}`)
    }
}

//----------------------------------------------------------------------------------

let ws=new Entity("workspaces")
await ws.create()
await ws.alter()
await ws.list()
//ws.erase()

