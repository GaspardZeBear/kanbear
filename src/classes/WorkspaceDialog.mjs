import { Dialog } from './Dialog.mjs'
import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'
import { sendEvent } from '../utils/sendEvent.mjs'

class WorkspaceDialog extends Dialog {

    constructor(dialogName) {
        super('workspace')
        this.dialogName = dialogName
        //this.projectId = projectId
        //this.buildHtmlDialog()
        //this.showDialog()
        this.workspace = null
    }

    //----------------------------------------------------------------------------
    create() {
        this.createDialog(this.save.bind(this))
        this.showDialog()
    }

    //-------------------------------------------------------------------------------------
    async save() {
        console.log("Workspace.save() dialog, field name", workspaceForm.workspaceName.value)
        const ws = await KanbearEntityFactory.generate('workspace')
           ws.setName(workspaceForm.workspaceName.value)
        ws.setDescription(workspaceForm.workspaceDescription.value)
        ws.setOpen(workspaceForm.workspaceIs_open.value)
        await ws.create()
        console.log("Workspace.save() dialog, created, <name>",ws.name,"<workspaceId>=", ws.getId())
        sendEvent("workspaceCreated",{ workspaceId: ws.getId() })
        this.closeDialog()
        this.workspace = ws
    }

}

export { WorkspaceDialog }