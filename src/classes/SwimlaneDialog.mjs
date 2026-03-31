import { Dialog } from './Dialog.mjs'
import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'

class SwimlaneDialog extends Dialog {

    constructor(dialogName, projectId) {
        super('swimlane')
        this.dialogName = dialogName
        this.projectId = projectId
        this.buildHtmlDialog()
        this.showDialog()
        this.swimlane = null
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
    async save() {
        console.log("Swimlane.save() dialog, field name", swimlaneForm.swimlaneName.value)
        const sw = await KanbearEntityFactory.generate('swimlane')
        sw.setData("project_id", this.projectId)
        sw.setName(swimlaneForm.swimlaneName.value)
        sw.setDescription(swimlaneForm.swimlaneDescription.value)
        sw.setOpen(swimlaneForm.swimlaneIs_open.value)
        await sw.create()
        console.log("Swimlane.save() dialog, created, <name>",sw.name,"<swimlaneId>=", sw.getId())
        //alert("Created")
        const swimlaneCreatedEvent = new CustomEvent("swimlaneCreated", {
            detail: { swimlaneId: sw.getId() },
            bubbles: true,
            cancelable: true,
            composed: true
        })
        //document.querySelectorAll(".projectCreated").dispatchEvent(projectCreatedEvent)
        document.dispatchEvent(swimlaneCreatedEvent)
        this.closeDialog()
        this.swimlane = sw
    }

}

export { SwimlaneDialog }