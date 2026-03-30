import { Dialog } from './Dialog.mjs'
import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'

class ColumnDialog extends Dialog {

    constructor(dialogName, projectId) {
        super()
        this.dialogName = dialogName
        this.projectId = projectId
        this.buildHtmlDialog()
        this.showDialog()
        this.column=null
    }

    //------------------------------------------------------------------------------------------
    buildHtmlDialog() {
        switch (this.dialogName) {
            case "create":
                this.createDialog()
                break
            default:
                console.log("ColumnDialog.buildHtmlDialog() unknown dialogName ", this.dialogName)
        }
    }

    //-------------------------------------------------------------------------------------
    createDialog() {
        this.dialog = document.getElementById("columnDialog")
        let dialog = this.dialog
        let close = this.closeDialog.bind(this)
        let save = this.save.bind(this)
        //document.getElementById("projectNameDiv").setAttribute("hidden","")
        document.getElementById("saveColumnBtn").addEventListener("click", function (event) {
            console.log("eventListener saveSwimlaneBtn dialog")
            save()
        });
        document.getElementById("cancelColumnBtn").addEventListener("click", function (event) {
            console.log("eventListener cancelBtn dialog")
            close();
        });
    }

    //-------------------------------------------------------------------------------------
    async save() {
        console.log("save() dialog, field name", columnForm.columnName.value)
        const co = await KanbearEntityFactory.generate('column')
        co.setData("project_id", this.projectId)
        co.setName(columnForm.columnName.value)
        co.setDescription(columnForm.columnDescription.value)
        await co.create()
        this.closeDialog()
        const columnCreatedEvent = new CustomEvent("columnCreated", {
            detail: { columnId: co.getId() },
            bubbles: true,
            cancelable: true,
            composed: true
        })
        //document.querySelectorAll(".projectCreated").dispatchEvent(projectCreatedEvent)
        document.dispatchEvent(columnCreatedEvent)
        this.column=co
    }

}

export { ColumnDialog }