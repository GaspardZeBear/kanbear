import { ApiCaller } from "./ApiCaller.mjs"
import { KanbearObject } from "./KanbearObject.mjs"

class Workspace extends KanbearObject {

    //------------------------------------------------------------------------
    constructor(workspace) {
        super(workspace)
        this.workspace = workspace
    }

    //----------------------------------------------------------------------------
    static generate() {
        return new Workspace({})
    }

    //----------------------------------------------------------------------------
    create() {
        const open=this.is_open?this.is_open:1
        
        const data={name:this.name,is_open:open}
        console.log("------------------",data)
        new ApiCaller().post("/api/workspaces",data)
    }

    //----------------------------------------------------------------------------
    xsetName(name) {
        this.name = name
    }

    //----------------------------------------------------------------------------
     xsetOpen(open) {
        this.is_open = open
    } 

    //----------------------------------------------------------------------------
    xsetDescription(decription) {
        this.description = this.description
    }
}

export { Workspace }
