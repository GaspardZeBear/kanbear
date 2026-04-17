import { Dialog } from './Dialog.mjs'
import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'
import { sendEvent } from '../utils/sendEvent.mjs'
import { Assignee } from './Assignee.mjs'
import { selectBoxBuilder, colorBoxBuilder, buildColorSelectBox } from '../utils/selectBoxBuilder.mjs'


class AssigneeDialog extends Dialog {

    constructor(dialogName) {
        super('assignee')
        this.dialogName = dialogName
        this.assignee=null
    }

    //----------------------------------------------------------------------------
    async fillFormFromDb(column) {
        console.log("AssigneeDialog.fillFormFromDb() column>", assignee)
        assigneeForm.assigneeName.value = assignee.name
        assigneeForm.assigneeDescription.value = assignee.description
        assigneeForm.assigneeTel.value = assignee.tel
        assigneeForm.assigneeEmail.value = assignee.email
    }

    //----------------------------------------------------------------------------
    async fillDbFromForm(assignee) {
        assignee.setData("name", assigneeForm.assigneeName.value)
        assignee.setData("description", assigneeForm.assigneeDescription.value)
        assignee.setData("tel", assigneeForm.assigneeTel.value)
        assignee.setData("email", assigneeForm.assigneeEmail.value)
        assignee.setName(assigneeForm.assigneeName.value)
        assignee.setDescription(assigneeForm.assigneeDescription.value)
    }

    //----------------------------------------------------------------------------
    subCreate(params) {
        console.log("AssigneeDialog.create() dialog, for  <params>",params)
        //this.projectId = params["projectId"]
    }

    //-------------------------------------------------------------------------------------
    async subSave(co) {
        console.log("AssigneeDialog.subSave() <name>", assigneeForm.assigneeName.value)
        //const pr = await KanbearEntityFactory.generate('project')
        //co.setData("project_id", this.projectId)
        this.fillDbFromForm(co)
    }

    //----------------------------------------------------------------------------
    async subModify(params) {
        console.log("AssigneeDialog.subModify() <params>", params)
        return( params["assigneeId"])
    }
}

export { AssigneeDialog }
