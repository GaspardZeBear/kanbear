import { ApiCaller } from "./ApiCaller.mjs"
import { KanbearEntity } from "./KanbearEntity.mjs"

class TaskComment extends KanbearEntity {

    //------------------------------------------------------------------------
    constructor(taskComment) {
        super('taskComment',taskComment)
        this.TaskComment = taskComment
    }

}

export { TaskComment }
