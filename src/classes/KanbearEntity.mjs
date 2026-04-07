import { ApiCaller } from "./ApiCaller.mjs"

class KanbearEntity {
    //------------------------------------------------------------------------
    constructor(kind, from = {}) {
        console.log("KanbearEntity.constructor() <kind>", kind, "<from>", from)
        this.kind = kind
        this.data = {}
        from.id ? this.id = from.id : undefined
        console.log("KanbearEntity.constructor() <from>", from)
        console.log("KanbearEntity.constructor() <this>", this)
    }

    //----------------------------------------------------------------------------
    getId() {
        return (this.id)
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
        } catch (error) {
            console.log("KanbearEntity.create() <error>", error)
            throw error
        }
    }
    //console.log("KanbearEntity.create() <resp>", resp)
    //if ( ! resp.error ) {
    //   resp.data.lastInsertRowid ? this.id = resp.data.lastInsertRowid : this.id=undefined
    //} 
    //return(resp)


    //-------------------------------------------------------------------------------
    static async getAll(kind, params) {
        const resp = await new ApiCaller().get(`/api/${kind}`, params)
        console.log("KanbearEntity.getAll()", resp.data)
        return (resp.data)
    }

    //-------------------------------------------------------------------------------
    async get(kind, params) {
        const resp = await new ApiCaller().get(`/api/${this.kind}s/${this.id}`, params)
        console.log("KanbearEntity.get()", resp.data)
        return (resp.data)
    }

    //-------------------------------------------------------------------------------
    async patch(kind, params) {
        const data = {}
        Object.entries(this.data).forEach(([key, val]) => {
            val ? data[key] = val : 1
        })
        console.log(data)
        const resp = await new ApiCaller().patch(`/api/${this.kind}s/${this.id}`, data)
        console.log("KanbearEntity.patch()", resp.data)
        return (resp.data)
    }

    //-------------------------------------------------------------------------------
    async delete(kind, params) {
        const data = {}
        Object.entries(this.data).forEach(([key, val]) => {
            val ? data[key] = val : 1
        })
        console.log("KanbearEntity.delete() <kind>", this.kind, "<id>", this.id, "<data>", data)
        const resp = await new ApiCaller().erase(`/api/${this.kind}s/${this.id}`, data)
        console.log("KanbearEntity.delete()", resp.data)
        return (resp.data)
    }

}

export { KanbearEntity }
