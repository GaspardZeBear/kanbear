import { Dialog } from './Dialog.mjs'
import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'
import { Task } from './Task.mjs'
import { sendEvent } from '../utils/sendEvent.mjs'

class TaskDialog extends Dialog {

    constructor(dialogName) {
        super('task')
        this.dialogName = dialogName
        //this.swimlaneId = swimlaneId
        //this.columnId = columnId
        //this.buildHtmlDialog()
        //this.showDialog()
        this.task=null
    }

    //----------------------------------------------------------------------------
    create(swimlaneId,columnId) {
        this.swimlaneId = swimlaneId
        this.columnId = columnId
        this.createDialog(this.save.bind(this))
        this.showDialog()
    }

    //----------------------------------------------------------------------------
    async modify(taskId) {
        this.taskId=taskId
        this.task = new Task({id:taskId})
        const ta = await this.task.get()
        console.log(ta)
        let taskForm=document.getElementById("taskForm")
        taskForm.taskNote.value="Tempo unavailable"
        taskForm.taskColor.value="blue"
        this.createDialog(this.saveModify.bind(this))
        this.showDialog()
    }
//-------------------------------------------------------------------------------------
    async saveModify() {
        console.log("TaskDialog.saveModify()")
        this.task.setData("description",taskForm.taskDescription.value)
        await this.task.patch({})
        this.closeDialog()
        sendEvent("taskModified",{ taskId : this.task.getId() })
        /*
        const taskModifiedEvent = new CustomEvent("taskModified", {
            detail: { taskId: this.task.getId() },
            bubbles: true,
            cancelable: true,
            composed: true
        })
        //document.querySelectorAll(".projectCreated").dispatchEvent(projectCreatedEvent)
        document.dispatchEvent(taskModifiedEvent)
        */
    }

   //-------------------------------------------------------------------------------------
    async save() {
        console.log("TaskDialog.save() dialog, field name", taskForm.taskName.value)
        const ta = await KanbearEntityFactory.generate('task')
        ta.setData("swimlane_id", this.swimlaneId)
        ta.setData("column_id",this.columnId)
        ta.setData("color",taskForm.taskColor.value)
        ta.setName(taskForm.taskName.value)
        ta.setDescription(taskForm.taskDescription.value)
        ta.setOpen(taskForm.taskIs_open.value)
        console.log("TaskDialog.save() <due>",taskForm.taskDueDate.value,"<time>",taskForm.taskDueTime.value,"<datetime>",taskForm.taskDueDateTime.value)
        await ta.create()
        this.closeDialog()
        /*
        const taskCreatedEvent = new CustomEvent("taskCreated", {
            detail: { taskId: ta.getId() },
            bubbles: true,
            cancelable: true,
            composed: true
        })
        //document.querySelectorAll(".projectCreated").dispatchEvent(projectCreatedEvent)
        document.dispatchEvent(taskCreatedEvent)
        this.task=ta
        */
       sendEvent("taskCreated",{ taskId: ta.getId() })
    }

}

export { TaskDialog }