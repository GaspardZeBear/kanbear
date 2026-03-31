import { Dialog } from './Dialog.mjs'
import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'

class ProjectDialog extends Dialog {

    //constructor(dialogName, workspaceId) {
    constructor(dialogName) {
        super('project')
        this.dialogName = dialogName
        //this.workspaceId = workspaceId
        //this.buildHtmlDialog()
        //this.showDialog()
        this.project=null
    }

    //----------------------------------------------------------------------------
    create(workspaceId) {
        this.workspaceId = workspaceId
        this.createDialog()
        this.showDialog()
    }

    //----------------------------------------------------------------------------
    getProject() {
        return(this.project)
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
              this.project=pr
        this.closeDialog()

        const projectCreatedEvent = new CustomEvent("projectCreated", {
            detail: { projectId: pr.getId() },
            bubbles: true,
            cancelable: true,
            composed: true
        })
        //document.querySelectorAll(".projectCreated").dispatchEvent(projectCreatedEvent)
        document.dispatchEvent(projectCreatedEvent)
  
    }

}

export { ProjectDialog }