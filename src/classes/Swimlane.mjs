import { ApiCaller } from "./ApiCaller.mjs"
import { KanbearEntity } from "./KanbearEntity.mjs"

class Swimlane extends KanbearEntity {

    //------------------------------------------------------------------------
    constructor(swimlane) {
        super('swimlane')
        this.swimlane = swimlane
    }

}

export { Swimlane }
