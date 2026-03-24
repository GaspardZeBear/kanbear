import { ApiCaller } from "./ApiCaller.mjs"

class KanbearEntity {
    //------------------------------------------------------------------------
    constructor(kind,from={}) {
        console.log("KanbearEntity.constructor() <kind>", kind, "<from>", from)
        this.kind = kind
        this.data = {}
        from.id ? this.id=from.id : undefined
        console.log(this)
    }

    //----------------------------------------------------------------------------
    getId() {
        return (this.id)
    }

    //----------------------------------------------------------------------------
    setId(id) {
        this.id=id
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
        console.log(`${this.kind} setData() ${dataKey}`, this.data)
    }

    //----------------------------------------------------------------------------
    async create() {
        // Remove undefined data
        const data = {}
        Object.entries(this.data).forEach(([key, val]) => {
            val ? data[key] = val : 1
        })
        console.log(data)
        const resp = await new ApiCaller().post(`/api/${this.kind}s`, data)
        console.log("resp ", resp.data)
        this.id = resp.data.lastInsertRowid
    }

    //-------------------------------------------------------------------------------
    static async getAll(kind, params) {
        const resp = await new ApiCaller().get(`/api/${kind}`, params)
        console.log("KanbearObject.getAll()", resp.data)
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
        console.log("KanbearObject.patch()", resp.data)
        return (resp.data)
    }

}

export { KanbearEntity }
