import { ApiCaller } from "./ApiCaller.mjs"

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
        let res = await new ApiCaller().get(this.api)
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
        res = await new ApiCaller().post(this.api, { name: this.name })
        //console.log(res.data)
        this.id = res.data["lastInsertRowid"]
    }

    //------------------------------------------------
    async alter() {
        let newName = this.name + '++'
        let res = await new ApiCaller().patch(`${this.api}/${this.id}`, { "name": newName })
        await get(`${this.api}/${this.id}`)

    }

    //---------------------------------------------------------
    async erase() {
        await new ApiCaller().erase(`${this.api}/${this.id}`)
    }
}

export { Entity }