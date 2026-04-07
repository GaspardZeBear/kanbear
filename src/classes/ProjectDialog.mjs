import { Dialog } from './Dialog.mjs'
import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'
import { sendEvent } from '../utils/sendEvent.mjs'

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
        this.createDialog(this.save.bind(this))
        this.showDialog("Create project")
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

        sendEvent("projectCreated",{ projectId: pr.getId() })
  
    }

}

export { ProjectDialog }