import { Dialog } from './Dialog.mjs'
import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'
import { Task } from './Task.mjs'
import { sendEvent } from '../utils/sendEvent.mjs'
import { fromDateTime, toDateTime } from '../utils/formatDuration.mjs'
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
    async fillFormFromDb(task) {
        console.log("TaskDialog.fillFormFromDb() <task>",task)
        let taskColor=await this.buildColorSelectBox()
        // fill in the form with db vales
        console.log("TaskDialog.fillFormFromDb() taskColorDiv",document.getElementById("taskColorDiv"))
        //let x=document.createElement('div')
        document.getElementById("taskColorDiv").replaceChildren(taskColor)
        taskForm.taskName.value = task.name
         console.log("TaskDialog.fillFormFromDb() taskName OK")
        //taskForm.taskColor.value = task.color
        taskForm.taskDescription.value = task.description
         console.log("TaskDialog.fillFormFromDb() tasDescription OK")
        taskForm.taskNote.value = task.note
        let dt=fromDateTime(task.date_due)
        console.log(dt)
        taskForm.taskDateDue.value=dt.date
        taskForm.taskTimeDue.value=dt.time
    }

    //----------------------------------------------------------------------------
    async fillDbFromForm(task) {
        task.setData("name", taskForm.taskName.value)
        task.setData("description", taskForm.taskDescription.value)
        task.setData("date_due",toDateTime(taskForm.taskDateDue.value,taskForm.taskTimeDue.value))
        task.setData("note", taskForm.taskNote.value)
        let color = taskForm.taskColor.value < 0 ? "white":taskForm.taskColor.value
        task.setData("color", color)
        task.setName(taskForm.taskName.value)
        task.setDescription(taskForm.taskDescription.value)
        task.setOpen(taskForm.taskIsOpen.value)
    }

//----------------------------------------------------------------------------
    async create(swimlaneId, columnId) {
        this.swimlaneId = swimlaneId
        this.columnId = columnId
        let taskColor=await this.buildColorSelectBox()
        document.getElementById("taskColorDiv").replaceChildren(taskColor)
        this.createDialog(this.save.bind(this))
        this.showDialog()
    }

    //-------------------------------------------------------------------------------------
    async save() {
        console.log("TaskDialog.save() dialog, field name", taskForm.taskName.value)
        const ta = await KanbearEntityFactory.generate('task')
        ta.setData("swimlane_id", this.swimlaneId)
        ta.setData("column_id", this.columnId)
        this.fillDbFromForm(ta)
        let resp=await ta.create()
        console.log(resp)
        if (! resp.error) {
        this.closeDialog()
        sendEvent("taskCreated", { taskId: ta.getId() })
        } else {
            this.create(this.swimlaneId,this.columnId)
        }
    }
    
    //----------------------------------------------------------------------------
    async modify(taskId) {
        this.taskId = taskId
        this.task = new Task({ id: taskId })
        const ta = await this.task.get()
        console.log("TaskDialog.modify() <ta>", ta)
        await this.fillFormFromDb(ta)
        this.createDialog(this.saveModify.bind(this))
        this.showDialog()
    }

    //-------------------------------------------------------------------------------------
    async saveModify() {
        console.log("TaskDialog.saveModify()")
        this.fillDbFromForm(this.task)
        let resp=await this.task.patch({})
        console.log(resp)
        if (! resp.error) {
          this.closeDialog()
          sendEvent("taskModified", { taskId: this.task.getId() })
        } else {
          this.modify(this.task.id)
        }
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