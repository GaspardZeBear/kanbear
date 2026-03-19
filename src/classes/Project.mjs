import { ApiCaller } from "./ApiCaller.mjs"
import { KanbearEntity } from "./KanbearEntity.mjs"

class Project extends KanbearEntity {

    //------------------------------------------------------------------------
    constructor(project) {
        super('project')
        this.project = project
    }

}

export { Project }
