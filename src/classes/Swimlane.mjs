import { ApiCaller } from "./ApiCaller.mjs"
import { KanbearObject } from "./KanbearObject.mjs"

class Swimlane extends KanbearObject {

    //------------------------------------------------------------------------
    constructor(swimlane) {
        super('swimlane')
        this.swimlane = swimlane
    }

    //----------------------------------------------------------------------------
    static generate() {
        return new Swimlane({})
    }

}

export { Swimlane }
