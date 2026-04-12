import { Dialog } from './Dialog.mjs'
import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'
import { sendEvent } from '../utils/sendEvent.mjs'

class WorkspaceDialog extends Dialog {

    constructor(dialogName) {
        super('workspace')
        this.dialogName = dialogName
        this.workspace = null
    }

    //----------------------------------------------------------------------------
    Xcreate() {
        this.createDialog(this.save.bind(this))
        this.showDialog()
    }

    //----------------------------------------------------------------------------
    async fillFormFromDb(workspace) {
        console.log("workspaceDialog.fillFormFromDb() workspace>", workspace)
        workspaceForm.workspaceName.value = workspace.name
        workspaceForm.workspaceDescription.value = workspace.description
        if (workspace.is_open > 0) {
            document.getElementById("workspaceIsOpen").setAttribute("checked", "")
        }
    }

    //----------------------------------------------------------------------------
    async fillDbFromForm(workspace) {
        workspace.setData("name", workspaceForm.workspaceName.value)
        workspace.setData("description", workspaceForm.workspaceDescription.value)
        workspace.setName(workspaceForm.workspaceName.value)
        workspace.setDescription(workspaceForm.workspaceDescription.value)
        if (workspaceForm.workspaceIsOpen.checked) {
            workspace.setData("is_open", 1)
        } else {
            workspace.setData("is_open", 0)
        }
    }

    //----------------------------------------------------------------------------
    subCreate(params) {
        console.log("workspaceDialog.create() dialog, for  <workspace>", params)
        //this.projectId = params["projectId"]
    }



    //-------------------------------------------------------------------------------------
    async Xsave() {
        console.log("Workspace.save() dialog, field name", workspaceForm.workspaceName.value)
        const ws = await KanbearEntityFactory.generate('workspace')
        ws.setName(workspaceForm.workspaceName.value)
        ws.setDescription(workspaceForm.workspaceDescription.value)
        ws.setOpen(workspaceForm.workspaceIs_open.value)
        await ws.create()
        console.log("Workspace.save() dialog, created, <name>", ws.name, "<workspaceId>=", ws.getId())
        sendEvent("workspaceCreated", { workspaceId: ws.getId() })
        this.closeDialog()
        this.workspace = ws
    }

    //-------------------------------------------------------------------------------------
    async subSave(ws) {
        console.log("workspaceDialog.subSave() <name>", workspaceForm.workspaceName.value)
        //const pr = await KanbearEntityFactory.generate('project')
        //co.setData("project_id", this.projectId)
        this.fillDbFromForm(ws)
    }

    //----------------------------------------------------------------------------
    async subModify(params) {
        console.log("workspaceDialog.subModify() <params>", params)
        return (params["workspaceId"])
    }

}

export { WorkspaceDialog }