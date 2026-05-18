import { Dialog } from './Dialog.mjs'
import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'
import { sendEvent } from '../utils/sendEvent.mjs'
import { User } from './User.mjs'
import { selectBoxBuilder, colorBoxBuilder, buildColorSelectBox } from '../utils/selectBoxBuilder.mjs'


class UserDialog extends Dialog {

    constructor(dialogName) {
        super('user')
        this.dialogName = dialogName
        this.user = null
    }

    //----------------------------------------------------------------------------
    async fillFormFromDb(user) {
        console.log("UserDialog.fillFormFromDb() column>", user)
        userForm.userName.value = user.name
        userForm.userDescription.value = user.description
        userForm.userTel.value = user.tel
        userForm.userEmail.value = user.email
        userForm.userPassword.value = user.params
        userForm.userIsAdmin.value = user.is_admin
        console.log("UserDialog() fillFormIsAdmin ", user.is_admin)
        if (user.is_admin > 0) {
            document.getElementById("userIsAdmin").setAttribute("checked", "")
        }
    }

    //----------------------------------------------------------------------------
    async fillDbFromForm(user) {
        user.setData("name", userForm.userName.value)
        user.setData("description", userForm.assigneeDescription.value)
        user.setData("tel", userForm.userTel.value)
        user.setData("email", userForm.userEmail.value)
        user.setData("password", userForm.userPassword.value)
        user.setName(userForm.userName.value)
        user.setDescription(userForm.userDescription.value)
        //task.setOpen(taskForm.taskIsOpen.value)
        if (userForm.userIsAdmin.checked) {
            user.setData("is_admin", 1)
        } else {
            user.setData("is_admin", 0)
        }
    }

    //----------------------------------------------------------------------------
    subCreate(params) {
        console.log("UserDialog.create() dialog, for  <params>", params)
        //this.projectId = params["projectId"]
    }

    //-------------------------------------------------------------------------------------
    async subSave(us) {
        console.log("UserDialog.subSave() <name>", userForm.userName.value)
        //const pr = await KanbearEntityFactory.generate('project')
        //co.setData("project_id", this.projectId)
        this.fillDbFromForm(us)
    }

    //----------------------------------------------------------------------------
    async subModify(params) {
        console.log("AssigneeDialog.subModify() <params>", params)
        return (params["userId"])
    }
}

export { UserDialog }
