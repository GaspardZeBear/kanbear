import { ApiCaller } from "./ApiCaller.mjs"
import { KanbearEntity } from "./KanbearEntity.mjs"

class Assignee extends KanbearEntity {

    //------------------------------------------------------------------------
    constructor(assignee) {
        super('assignee',assignee)
        this.assignee = assignee
    }

}

export { Assignee }
