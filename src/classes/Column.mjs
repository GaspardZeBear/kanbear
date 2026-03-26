import { ApiCaller } from "./ApiCaller.mjs"
import { KanbearEntity } from "./KanbearEntity.mjs"

class Column extends KanbearEntity {

    //------------------------------------------------------------------------
    constructor(column) {
        super('column',column)
        this.column = column
    }

}

export { Column }
