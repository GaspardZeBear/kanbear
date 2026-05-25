import { Dialog } from './Dialog.mjs'
import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'
import { sendEvent } from '../utils/sendEvent.mjs'
import { TasksComments } from './TasksComments.mjs'
import { selectBoxBuilder, colorBoxBuilder, buildColorSelectBox } from '../utils/selectBoxBuilder.mjs'


class TasksCommentsDialog extends Dialog {

    constructor(dialogName,parms) {
        super('tasksComments')
        this.dialogName = dialogName
        this.tasksComments=null
        this.taskId=parms["taskId"]
    }

    //----------------------------------------------------------------------------
    async fillFormFromDb(tasksComments) {
        console.log("tasksCommentsDialog.fillFormFromDb() column>", tasksComments)
        tasksCommentsForm.tasksCommentsComment.value = tasksComments.comment
    }

    //----------------------------------------------------------------------------
    async fillDbFromForm(tasksComments) {
        tasksComments.setData("comment", tasksCommentsForm.tasksCommentsComment.value)
        tasksComments.setData("task_id",this.taskId)
        tasksComments.setData("user_id",1)
        tasksComments.setData("date_created", Math.floor(Date.now() / 1000));
        tasksComments.setData("date_modified", Math.floor(Date.now() / 1000));
    }

    //----------------------------------------------------------------------------
    subCreate(params) {
        console.log("tasksCommentsDialog.create() dialog, for  <params>",params)
        //this.projectId = params["projectId"]
    }

    //-------------------------------------------------------------------------------------
    async subSave(co) {
        console.log("tasksCommentsDialog.subSave() <name>", tasksCommentsForm.tasksCommentsComment.value)
        //const pr = await KanbearEntityFactory.generate('project')
        //co.setData("project_id", this.projectId)
        this.fillDbFromForm(co)
    }

    //----------------------------------------------------------------------------
    async subModify(params) {
        console.log("tasksCommentsDialog.subModify() <params>", params)
        return( params["tasksCommentsId"])
    }
}

export { TasksCommentsDialog }
