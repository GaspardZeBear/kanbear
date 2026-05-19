import { ApiCaller } from "./ApiCaller.mjs"
import { KanbearEntity } from "./KanbearEntity.mjs"

class TasksComments extends KanbearEntity {

    //------------------------------------------------------------------------
    constructor(tasksComments) {
        super('taskComments',tasksComments)
        this.TasksComments = tasksComments
    }

}

export { TasksComments }
