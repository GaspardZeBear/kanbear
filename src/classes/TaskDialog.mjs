import { Dialog } from './Dialog.mjs'
import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'
import { Task } from './Task.mjs'
import { sendEvent } from '../utils/sendEvent.mjs'
import { fromDateTime, toDateTime } from '../utils/dateAndTime.mjs'
import { colorBoxBuilder, buildColorSelectBox } from '../utils/selectBoxBuilder.mjs'

class TaskDialog extends Dialog {

    constructor(dialogName) {
        super('task')
        this.dialogName = dialogName
        this.task = null
    }

    //----------------------------------------------------------------------------
    async fillFormFromDb(task) {
        console.log("TaskDialog.fillFormFromDb() <task>", task)
        //let taskColor = await this.buildColorSelectBox(task.color)
        let taskColor = await buildColorSelectBox(task.color,'taskColor','Task Color')
        document.getElementById("taskColorDiv").replaceChildren(taskColor)
        taskForm.taskName.value = task.name
        taskForm.taskDescription.value = task.description
        taskForm.taskNote.value = task.note
        let dt = fromDateTime(task.date_due)
        taskForm.taskDateDue.value = dt.date
        taskForm.taskTimeDue.value = dt.time
        taskForm.taskIsOpen.value=task.is_open
        console.log("TaskDialog() fillFormIsOpen ",task.is_open)
        if ( task.is_open > 0) {
            document.getElementById("taskIsOpen").setAttribute("checked","")
        } 
    }

    //----------------------------------------------------------------------------
    async fillDbFromForm(task) {
        task.setData("name", taskForm.taskName.value)
        task.setData("description", taskForm.taskDescription.value)
        task.setData("date_due", toDateTime(taskForm.taskDateDue.value, taskForm.taskTimeDue.value))
        task.setData("note", taskForm.taskNote.value)
        let color = taskForm.taskColor.value < 0 ? "white" : taskForm.taskColor.value
        task.setData("color", color)
        task.setName(taskForm.taskName.value)
        task.setDescription(taskForm.taskDescription.value)
        //task.setOpen(taskForm.taskIsOpen.value)
        if (taskForm.taskIsOpen.checked) {
            task.setData("is_open", 1)
        } else {
            task.setData("is_open", 0)
        }
        console.log("TaskDialog() fillDb IsOpen ",taskForm.taskIsOpen.checked)
    }

    //----------------------------------------------------------------------------
    async create(swimlaneId, columnId) {
        this.swimlaneId = swimlaneId
        this.columnId = columnId
        //let taskColor = await this.buildColorSelectBox()
        let taskColor =  await buildColorSelectBox('','taskColor','Task Color')
        document.getElementById("taskColorDiv").replaceChildren(taskColor)
        this.createDialog(this.save.bind(this))
        this.showDialog("Create task")
    }

    //-------------------------------------------------------------------------------------
    async save() {
        console.log("TaskDialog.save() dialog, field name", taskForm.taskName.value)
        const ta = await KanbearEntityFactory.generate('task')
        ta.setData("swimlane_id", this.swimlaneId)
        ta.setData("column_id", this.columnId)
        this.fillDbFromForm(ta)
        try {
            let resp = await ta.create()
            this.closeDialog()
            sendEvent("taskCreated", { taskId: ta.getId() })
        } catch (error) {
            this.setMessage(error.cause?.msg)
            this.create(this.swimlaneId, this.columnId)
        }
    }

    //----------------------------------------------------------------------------
    async modify(taskId) {
        this.taskId = taskId
        this.task = new Task({ id: taskId })
        try {
            const ta = await this.task.get()
            console.log("TaskDialog.modify() <ta>", ta)
            await this.fillFormFromDb(ta)
            this.createDialog(this.saveModify.bind(this))
            this.showDialog("Modify task")
        } catch (error) {
            this.setMessage(error.cause?.msg)
            this.modify(this.taskId)
        }
    }

    //-------------------------------------------------------------------------------------
    async saveModify() {
        console.log("TaskDialog.saveModify()")
        this.fillDbFromForm(this.task)
        try {
            let resp = await this.task.patch({})
            this.closeDialog()
            sendEvent("taskModified", { taskId: this.task.getId() })
        } catch (error) {
            this.setMessage(error.cause?.msg)
            this.modify(this.task.id)
        }
    }
}



export { TaskDialog }