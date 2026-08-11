import { ApiCaller } from "./ApiCaller.mjs"

class KanbearEntity {

    // Translate entity kin to api route
    // !! Beware, an 's' char ist added by POST, PUT etc .... so remove it from translation
    static apiTablesMap = { 
        "tasksComments": "tasks_comment",
        "projectsRights": "projects_right"
     }
    //------------------------------------------------------------------------
    constructor(kind, from = {}) {
        console.log("KanbearEntity.constructor() <kind>", kind, "<from>", from)
        this.kind = kind
        if (KanbearEntity.apiTablesMap[kind]) {
            this.kind = KanbearEntity.apiTablesMap[kind]
        }
        this.data = {} // will contain attributes to create or patch 
        this.fromDb = {} // conatains raw retried from db 
        from.id ? this.id = from.id : undefined
        //console.log("KanbearEntity.constructor()","<kind>",kind,"<this.kind>", this.kind)
        //console.log("KanbearEntity.constructor() <from>", from)
        //console.log("KanbearEntity.constructor() <this>", this)
    }

    //----------------------------------------------------------------------------
    getId() {
        return (this.id)
    }

    //----------------------------------------------------------------------------
    getName() {
        return (this.name)
    }

    //----------------------------------------------------------------------------
    setId(id) {
        this.id = id
    }

    //----------------------------------------------------------------------------
    setName(name) {
        this.data.name = name
    }

    //----------------------------------------------------------------------------
    setOpen(open) {
        this.data.is_open = open
    }

    //----------------------------------------------------------------------------
    setDescription(description) {
        this.data.description = description
    }

    setData(dataKey, dataval) {
        this.data[dataKey] = dataval
        console.log(`KanbearEntity.setData() ${this.kind} setData() ${dataKey}`, this.data)
    }

    //----------------------------------------------------------------------------
    async create() {
        // Remove undefined data
        const data = {}
        Object.entries(this.data).forEach(([key, val]) => {
            val ? data[key] = val : 1
        })
        console.log("KanbearEntity.create() <data>", data)
        try {
            const resp = await new ApiCaller().post(`/api/${this.kind}s`, data)
            console.log("KanbearEntity.create() <resp>", resp)
            this.setId(resp.data.lastInsertRowid)
            await this.postCreate(this.id)
        } catch (error) {
            console.log("KanbearEntity.create() <error>", error)
            throw error
        }
    }

    //-------------------------------------------------------------------------------------
    // once saved in db, maybe need something to do 
    async postCreate(id) {
    }

    //-------------------------------------------------------------------------------
    static async getAll(kind, params) {
        try {
            const resp = await new ApiCaller().get(`/api/${kind}`, params)
            console.log("KanbearEntity.getAll()", "<kind>", kind, "<data>", resp.data)
            return (resp.data)
        } catch (error) {
            console.log("KanbearEntity.getAll() <error>", error)
            throw error
        }
    }

    //-------------------------------------------------------------------------------
    async get(kind, params) {
        const resp = await new ApiCaller().get(`/api/${this.kind}s/${this.id}`, params)
        console.log("KanbearEntity.get()", "<resp.data>", resp.data)
        this.fromDb = resp.data
        return (resp.data)
    }

    //-------------------------------------------------------------------------------
    async patch(kind, params) {
        const data = {}
        console.log("KanbearEntity.patch()", "<kind>", this.kind, "<id>", this.id, "<this.data>", this.data)
        Object.entries(this.data).forEach(([key, val]) => {
            val ? data[key] = val : 1
        })
        console.log("KanbearEntity.patch() effective <data>", data)
        // !!!! send this.data and noot data (not useful) ??????????
        const resp = await new ApiCaller().patch(`/api/${this.kind}s/${this.id}`, this.data)
        console.log("KanbearEntity.patch()", "<resp.data>", resp.data)
        await this.postPatch(this.data)
        return (resp.data)
    }

    //-------------------------------------------------------------------------------------
    // once saved in db, maybe need something to do 
    async postPatch() {
    }

    //-------------------------------------------------------------------------------
    async delete(kind, params) {
        const data = {}
        Object.entries(this.data).forEach(([key, val]) => {
            val ? data[key] = val : 1
        })
        console.log("KanbearEntity.delete()", "<kind>", this.kind, "<id>", this.id, "<data>", data)
        const resp = await new ApiCaller().erase(`/api/${this.kind}s/${this.id}`, data)
        console.log("KanbearEntity.delete() <resp>", resp)
        return (resp.data)
    }

}

export { KanbearEntity }
