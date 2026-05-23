import { ApiCaller } from "./ApiCaller.mjs"
import { KanbearEntity } from "./KanbearEntity.mjs"

class TasksComments extends KanbearEntity {

    //------------------------------------------------------------------------
    constructor(tasksComments) {
        super('tasksComments',tasksComments)
        this.tasksComments = tasksComments
    }

//-------------------------------------------------------------------------------
    static async getByTaskId(kind, params) {
        console.log("KanbearEntity.getByTaskId())","<params>",params)
        const resp = await new ApiCaller().get(`/api/${kind}/task/${params["task_id"]}`, params)
        console.log("KanbearEntity.getByTaskId())", resp.data)
        return (resp.data)
    }


}

export { TasksComments }
