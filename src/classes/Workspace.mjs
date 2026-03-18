import { ApiCaller } from "./ApiCaller.mjs"
import { KanbearObject } from "./KanbearObject.mjs"

class Workspace extends KanbearObject {

    //------------------------------------------------------------------------
    constructor(workspace) {
        super('workspace')
        this.workspace = workspace
    }

    //----------------------------------------------------------------------------
    static generate() {
        return new Workspace({})
    }

    
}

export { Workspace }
