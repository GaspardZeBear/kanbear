import { sendEvent } from '../utils/sendEvent.mjs'
import { ApiCaller } from './ApiCaller.mjs'
import { Kontext } from './Kontext.mjs'

class LoginDialog {

    constructor(dialogName) {
        this.dialogName = dialogName
        this.dialog = document.getElementById("loginDialog")
    }

    //----------------------------------------------------------------------------
    create(params = {}) {
        this.params = params
        this.createDialog()
        this.dialog.showModal();
    }

    //-------------------------------------------------------------------------------------
    async submit() {
        console.log("LoginDialog.save() dialog")
        try {
            //this.closeDialog()
            //let eventId=`LoId`
            // Here call /login !!!!!!!!!!!!!!!!!!!!!!!!!
            // if success, save JWT token
            //sendEvent(`LoginDone`, { [eventId] : entity.getId() })
            //let userName=loginForm.userName.value
            //let userPassword=loginForm.userPassword.value
            let params = {
                userName: loginForm.loginName.value,
                userPassword: loginForm.loginPassword.value
            }
            const resp = await new ApiCaller().post(`/api/login`, params)
            console.log("LoginDialog submit()", "userId", resp.data.userId, "resp token", resp.data.token)
            Kontext.setUserName(loginForm.loginName.value)
            Kontext.setUserId(resp.data.userId)
            Kontext.setJwtoken(resp.data.token)
            sendEvent('loginOk')
        } catch (error) {
            console.log("LoginDialog.submit() <error>", error)
            sendEvent('loginKo')
        } finally {

        }
    }


    //----------------------------------------------------------------------------
    createDialog() {
        console.log("LoginDialog.createDialog() ")
        this.dialog.setAttribute("closedby", "none")
        let close = this.closeDialog.bind(this)
        let submitBtnId = "submitLoginBtn"
        let submit = this.submit
        let submitFn = async function (event) {
            await submit()
            close()
        }
        console.log("Dialog.createDialog <saveBtn>", document.getElementById(submitBtnId))
        document.getElementById(submitBtnId).addEventListener("click", submitFn, { once: true });
        let cancelBtnId = "cancelLoginBtn"
        let cancel = this.cancelDialog.bind(this)
        let cancelFn = function (event) {
            console.log("eventListener", cancelBtnId, "dialog")
            cancel();
        }
        document.getElementById(cancelBtnId).addEventListener("click", cancelFn, { once: true });
    }

    //------------------------------------------------------------------------------------------------
    closeDialog() {
        console.log("closeDialog()", this.dialog)
        this.dialog.close();
    }

    //-------------------------------------------------------------
    cancelDialog() {
        sendEvent("loginCancelled", {})
        this.closeDialog();
    }


}

export { LoginDialog }
