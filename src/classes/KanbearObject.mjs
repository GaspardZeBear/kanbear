import { ApiCaller } from "./ApiCaller.mjs"

class KanbearObject {
    //------------------------------------------------------------------------
    constructor(kind) {
        this.kind = kind
        this.data={}
        this.id=undefined
    }

    
    //----------------------------------------------------------------------------
    getId() {
        return(this.id)
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

    setData(dataKey,dataval) {
        this.data[dataKey]=dataval
        console.log("setData", this.data)
    }

    //----------------------------------------------------------------------------
    async create() {
        //const open=this.is_open?this.is_open:1
        //const data={name:this.name,is_open:open}
        console.log("----------- create() this.data ",this.data)
        const resp=await new ApiCaller().post(`/api/${this.kind}s`,this.data)
        console.log("resp ",resp.data)
        this.id=resp.data.lastInsertRowid
    }

    //-------------------------------------------------------------------------------

    static async getAll(kind) {
       const resp= await new ApiCaller().get(`/api/${kind}`)
       console.log(resp.data)
       return(resp.data)
    }

}

export { KanbearObject }
