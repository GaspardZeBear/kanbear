import { Dialog } from './Dialog.mjs'
import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'

class SwimlaneDialog extends Dialog {

    constructor(dialogName, projectId) {
        super()
        this.dialogName = dialogName
        this.projectId = projectId
        this.buildHtmlDialog()
        this.showDialog()
        this.swimlane=null
    }

    //------------------------------------------------------------------------------------------
    buildHtmlDialog() {
        switch (this.dialogName) {
            case "create":
                this.createDialog()
                break
            default:
                console.log("ProjectDialog.buildHtmlDialog() unknown dialogName ", this.dialogName)
        }
    }

    //-------------------------------------------------------------------------------------
    createDialog() {
        this.dialog = document.getElementById("swimlaneDialog")
        let dialog = this.dialog
        let close = this.closeDialog.bind(this)
        let save = this.save.bind(this)
        //document.getElementById("projectNameDiv").setAttribute("hidden","")
        document.getElementById("saveSwimlaneBtn").addEventListener("click", function (event) {
            console.log("eventListener saveSwimlaneBtn dialog")
            save()
        });
        document.getElementById("cancelSwimlaneBtn").addEventListener("click", function (event) {
            console.log("eventListener cancelBtn dialog")
            close();
        });
    }

    //-------------------------------------------------------------------------------------
    async save() {
        console.log("save() dialog, field name", swimlaneForm.swimlaneName.value)
        const sw = await KanbearEntityFactory.generate('swimlane')
        sw.setData("project_id", this.projectId)
        sw.setName(swimlaneForm.swimlaneName.value)
        sw.setDescription(swimlaneForm.swimlaneDescription.value)
        sw.setOpen(swimlaneForm.swimlaneIs_open.value)
        await sw.create()
        this.closeDialog()
        const swimlaneCreatedEvent = new CustomEvent("swimlaneCreated", {
            detail: { swimlaneId: sw.getId() },
            bubbles: true,
            cancelable: true,
            composed: true
        })
        //document.querySelectorAll(".projectCreated").dispatchEvent(projectCreatedEvent)
        document.dispatchEvent(swimlaneCreatedEvent)
        this.swimlane=sw
    }

}

export { SwimlaneDialog }