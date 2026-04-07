import { Dialog } from './Dialog.mjs'
import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'
import { sendEvent } from '../utils/sendEvent.mjs'

class ColumnDialog extends Dialog {

    constructor(dialogName) {
        super('column')
        this.dialogName = dialogName
        //this.projectId = projectId
        //this.buildHtmlDialog()
        //this.showDialog()
        this.column=null
    }

     //----------------------------------------------------------------------------
    create(projectId) {
        this.projectId = projectId
        this.createDialog(this.save.bind(this))
        this.showDialog("Create column")
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
        sendEvent("columnCreated",{ columnId: co.getId() })
        this.column=co
    }

}

export { ColumnDialog }