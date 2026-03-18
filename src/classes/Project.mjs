import { ApiCaller } from "./ApiCaller.mjs"
import { KanbearObject } from "./KanbearObject.mjs"

class Project extends KanbearObject {

    //------------------------------------------------------------------------
    constructor(project) {
        super('project')
        this.project = project
    }

    //----------------------------------------------------------------------------
    static generate() {
        return new Project({})
    }

    
}

export { Project }
