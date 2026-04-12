import { Dialog } from './Dialog.mjs'
import { AssigneeDialog } from './AssigneeDialog.mjs'
import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'
import { Task } from './Task.mjs'
import { Assignee } from './Assignee.mjs'
import { sendEvent } from '../utils/sendEvent.mjs'
import { fromDateTime, toDateTime } from '../utils/dateAndTime.mjs'
import { selectBoxBuilder, buildColorSelectBox } from '../utils/selectBoxBuilder.mjs'

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
        let taskColor = await buildColorSelectBox(task.color, 'taskColor', 'Task Color')
        document.getElementById("taskColorDiv").replaceChildren(taskColor)
        taskForm.taskName.value = task.name
        taskForm.taskDescription.value = task.description
        taskForm.taskNote.value = task.note

        await this.setAssignees(task)

        let dt = fromDateTime(task.date_due)
        taskForm.taskDateDue.value = dt.date
        taskForm.taskTimeDue.value = dt.time
        taskForm.taskIsOpen.value = task.is_open
        console.log("TaskDialog() fillFormIsOpen ", task.is_open)
        if (task.is_open > 0) {
            document.getElementById("taskIsOpen").setAttribute("checked", "")
        }
    }

    //----------------------------------------------------------------------------
    async setAssignees() {
        let ass = await Assignee.getAll('assignees')
        ass.unshift({ id: -1, name: '* Create new assignee' })
        let boxName = "kanbearAssigneeSelectBox"
        let boxParams = {
            domId: boxName,
            boxLabel: "assignee",
            items: ass,
            labelText: "assignee",
            klass: "filter-group",
            //headItems:[['* Create new workspace',-1]]
        }
        let asDiv = await selectBoxBuilder(boxParams)
        console.log("TaskDialog.fillFormFronDb() <asDiv>", asDiv)
        document.getElementById("taskAssigneeDiv").replaceChildren(asDiv)
        document.getElementById(boxName).addEventListener('change', async (e) => {
            let assigneeId = parseInt(e.target.value)
            if (assigneeId == -1) {
                //let newProject =new ProjectDialog("create",workspaceId)
                let newAssignee = new AssigneeDialog()
                newAssignee.create()
                return
            }
            if (assigneeId < 0) {
                return
            }
        })
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
        console.log("TaskDialog() fillDb IsOpen ", taskForm.taskIsOpen.checked)
    }

    //----------------------------------------------------------------------------
    async subCreate(params) {
        console.log("TaskDialog.create() dialog, for  <params>", params)
        this.swimlaneId = params["swimlaneId"]
        this.columnId = params["columnId"]
        //let taskColor = await this.buildColorSelectBox()
        let taskColor = await buildColorSelectBox('', 'taskColor', 'Task Color')
        document.getElementById("taskColorDiv").replaceChildren(taskColor)
        await this.setAssignees()
    }

    //-------------------------------------------------------------------------------------
    async subSave(ta) {
        console.log("TaskDialog.subSave() <name>", taskForm.taskName.value)
        //const pr = await KanbearEntityFactory.generate('project')
        ta.setData("swimlane_id", this.swimlaneId)
        ta.setData("column_id", this.columnId)
        this.fillDbFromForm(ta)
    }

    //----------------------------------------------------------------------------
    async subModify(params) {
        console.log("TaskDialog.subModify() <params>", params)
        return (params["taskId"])
    }

}

export { TaskDialog }