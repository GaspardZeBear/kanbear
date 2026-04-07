import { Dialog } from './Dialog.mjs'
import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'
import { sendEvent } from '../utils/sendEvent.mjs'

class SwimlaneDialog extends Dialog {

    constructor(dialogName) {
        super('swimlane')
        this.dialogName = dialogName
        //this.projectId = projectId
        //this.buildHtmlDialog()
        //this.showDialog()
        this.swimlane = null
    }

    //----------------------------------------------------------------------------
    create(projectId) {
        this.projectId = projectId
        this.createDialog(this.save.bind(this))
        this.showDialog("Create swimlane")
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
        sendEvent("swimlaneCreated",{ swimlaneId: sw.getId() })
        this.closeDialog()
        this.swimlane = sw
    }

}

export { SwimlaneDialog }