import { Dialog } from './Dialog.mjs'
import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'
import { sendEvent } from '../utils/sendEvent.mjs'
import { Group } from './Group.mjs'
import { selectBoxBuilder, colorBoxBuilder, buildColorSelectBox } from '../utils/selectBoxBuilder.mjs'


class GroupDialog extends Dialog {

    constructor(dialogName) {
        super('group')
        this.dialogName = dialogName
        this.group = null
    }

    //----------------------------------------------------------------------------
    async fillFormFromDb(group) {
        console.log("GroupDialog.fillFormFromDb() column>", group)
        groupForm.groupName.value = group.name
        groupForm.groupDescription.value = group.description
    }

    //----------------------------------------------------------------------------
    async fillDbFromForm(group) {
        group.setData("name", groupForm.groupName.value)
        group.setData("description", groupForm.groupDescription.value)
        group.setName(groupForm.groupName.value)
        group.setDescription(groupForm.groupDescription.value)
        //task.setOpen(taskForm.taskIsOpen.value)
    }

    //----------------------------------------------------------------------------
    subCreate(params) {
        console.log("GroupDialog.create() dialog, for  <params>", params)
        //this.projectId = params["projectId"]
    }

    //-------------------------------------------------------------------------------------
    async subSave(gr) {
        console.log("GroupDialog.subSave() <name>", groupForm.groupName.value)
        //const pr = await KanbearEntityFactory.generate('project')
        //co.setData("project_id", this.projectId)
        this.fillDbFromForm(gr)
    }

    //----------------------------------------------------------------------------
    async subModify(params) {
        console.log("AssigneeDialog.subModify() <params>", params)
        return (params["groupId"])
    }
}

export { GroupDialog }
