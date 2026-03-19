import { ApiCaller } from "./ApiCaller.mjs"
import { KanbearEntity } from "./KanbearEntity.mjs"

class Workspace extends KanbearEntity {

    //------------------------------------------------------------------------
    constructor(workspace) {
        super('workspace')
        this.workspace = workspace
    }
}

export { Workspace }
