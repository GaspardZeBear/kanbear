import { ApiCaller } from "./ApiCaller.mjs"
import { KanbearEntity } from "./KanbearEntity.mjs"

class Group extends KanbearEntity {

    //------------------------------------------------------------------------
    constructor(group) {
        super('group',group)
        this.group = group
    }

}

export { Group }
