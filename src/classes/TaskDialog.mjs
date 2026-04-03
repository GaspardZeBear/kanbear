import { Dialog } from './Dialog.mjs'
import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'
import { Task } from './Task.mjs'
import { sendEvent } from '../utils/sendEvent.mjs'
import { colorBoxBuilder } from '../utils/selectBoxBuilder.mjs'

class TaskDialog extends Dialog {

    constructor(dialogName) {
        super('task')
        this.dialogName = dialogName
        //this.swimlaneId = swimlaneId
        //this.columnId = columnId
        //this.buildHtmlDialog()
        //this.showDialog()
        this.task = null
    }

    //---------------------------------------------------------------------------
    async buildColorSelectBox() {
        let taskColor = await colorBoxBuilder({
            domId: 'taskColor',
            label: 'taskColor',
            labelText: 'Task color',
            boxLabel: 'taskColor',
            klass: 'filter-group'
        })
        return(taskColor)
        // document.getElementById("taskColorDiv").appendChild(taskColor)
    }

    //----------------------------------------------------------------------------
    create(swimlaneId, columnId) {
        this.swimlaneId = swimlaneId
        this.columnId = columnId
        let taskColor=this.buildColorSelectBox()
        document.getElementById("taskColorDiv").appendChild(taskColor)
        this.createDialog(this.save.bind(this))
        this.showDialog()
    }

    //----------------------------------------------------------------------------
    async modify(taskId) {

        this.taskId = taskId

        this.task = new Task({ id: taskId })
        const ta = await this.task.get()
        console.log("TaskDialog.modify() <ta>", ta)
        let taskColor=await this.buildColorSelectBox()
        console.log("taskColorDiv",document.getElementById("taskColorDiv"))
        //let x=document.createElement('div')
        document.getElementById("taskColorDiv").appendChild(taskColor)
        taskForm.taskName.value = ta.name
        taskForm.taskColor.value = ta.color
        taskForm.taskDescription.value = ta.description
        taskForm.taskNote.value = ta.note


        this.createDialog(this.saveModify.bind(this))
        this.showDialog()
    }
    //-------------------------------------------------------------------------------------
    async saveModify() {
        console.log("TaskDialog.saveModify()")
        console.log("TaskDialog.saveModify() color", taskForm.taskColor.value)
        this.task.setData("name", taskForm.taskName.value)
        this.task.setData("description", taskForm.taskDescription.value)
        this.task.setData("note", taskForm.taskNote.value)
        this.task.setData("color", taskForm.taskColor.value)
        await this.task.patch({})
        this.closeDialog()
        sendEvent("taskModified", { taskId: this.task.getId() })
    }

    //-------------------------------------------------------------------------------------
    async save() {
        console.log("TaskDialog.save() dialog, field name", taskForm.taskName.value)
        const ta = await KanbearEntityFactory.generate('task')
        ta.setData("swimlane_id", this.swimlaneId)
        ta.setData("column_id", this.columnId)
        ta.setData("color", taskForm.taskColor.value)
        ta.setName(taskForm.taskName.value)
        ta.setDescription(taskForm.taskDescription.value)
        ta.setOpen(taskForm.taskIsOpen.value)
        console.log("TaskDialog.save() <due>", taskForm.taskDueDate.value, "<time>", taskForm.taskDueTime.value, "<datetime>", taskForm.taskDueDateTime.value)
        await ta.create()
        this.closeDialog()
        sendEvent("taskCreated", { taskId: ta.getId() })
    }

    //----------------------------------------------------------------------------
    async Xmodify(taskId) {

        this.taskId = taskId

        this.task = new Task({ id: taskId })
        const ta = await this.task.get()
        console.log("TaskDialog.modify() <ta>", ta)

        let taskForm = document.getElementById("taskForm")

        let formData = new FormData(taskForm)
        console.log("TaskDialog.modify() <form2Db>", Task.form2Db)
        console.log("TaskDialog.modify() <db2Form>", Task.db2Form)
        for (let entry of formData.entries()) {
            let name = entry[0]
            let key = Task.form2Db[name]
            console.log("TaskDialog.modify() <name>", name); // key1 = value1, ensuite key2 = value2
            console.log("TaskDialog.modify() <ta key>", Task.form2Db[name])
            console.log("TaskDialog.modify() <ta>", ta[key])
            formData.set(name, ta[key])
            //taskForm[name].value=ta[key]
        }
        console.log("formData", formData)

        console.log("TaskDialog.modify() <form.elements>", taskForm.elements)
        Object.entries(taskForm.elements).forEach((item) => {
            console.log("TaskDialog.modify() <form.elements>", item, item[1].id)
            let name = item[1].id
            let key = Task.form2Db[name]
            taskForm[name].value = ta[key]
            console.log("TaskDialog.modify() <taskForm>", taskForm[name])
        })

        this.createDialog(this.saveModify.bind(this))
        this.showDialog()
    }

}



export { TaskDialog }