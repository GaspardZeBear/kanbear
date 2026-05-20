import { ApiCaller } from "./ApiCaller.mjs"
import { KanbearEntity } from "./KanbearEntity.mjs"

class TasksComments extends KanbearEntity {

    //------------------------------------------------------------------------
    constructor(tasksComments) {
        super('tasksComments',tasksComments)
        this.tasksComments = tasksComments
    }

}

export { TasksComments }
