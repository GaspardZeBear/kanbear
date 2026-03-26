import { ApiCaller } from "./ApiCaller.mjs"
import { KanbearEntity } from "./KanbearEntity.mjs"

class Project extends KanbearEntity {

    //------------------------------------------------------------------------
    constructor(project) {
        super('project',project)
        this.project = project
    }

}

export { Project }
