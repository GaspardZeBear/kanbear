import { Dialog } from './Dialog.mjs'
import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'

class ProjectDialog extends Dialog {

    constructor(dialogName, workspaceId) {
        super('project')
        this.dialogName = dialogName
        this.workspaceId = workspaceId
        this.buildHtmlDialog()
        this.showDialog()
        this.project=null
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
        console.log("processSave() dialog, field name", projectForm.projectName.value)
        const pr = await KanbearEntityFactory.generate('project')
        pr.setData("workspace_id", this.workspaceId)
        pr.setName(projectForm.projectName.value)
        pr.setDescription(projectForm.projectDescription.value)
        pr.setOpen(projectForm.projectIs_open.value)
        await pr.create()
        this.closeDialog()
        const projectCreatedEvent = new CustomEvent("projectCreated", {
            detail: { projectId: pr.getId() },
            bubbles: true,
            cancelable: true,
            composed: true
        })
        //document.querySelectorAll(".projectCreated").dispatchEvent(projectCreatedEvent)
        document.dispatchEvent(projectCreatedEvent)
        this.project=pr
    }

}

export { ProjectDialog }