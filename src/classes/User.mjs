import { ApiCaller } from "./ApiCaller.mjs"
import { KanbearEntity } from "./KanbearEntity.mjs"

class User extends KanbearEntity {

    //------------------------------------------------------------------------
    constructor(user) {
        super('user',user)
        this.user = user
    }

}

export { User }
