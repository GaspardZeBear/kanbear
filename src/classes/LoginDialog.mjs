import { sendEvent } from '../utils/sendEvent.mjs'
import { ApiCaller } from './ApiCaller.mjs'
import { Kontext } from './Kontext.mjs'
import { jwtDecode } from "jwt-decode";

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
            console.log("LoginDialog submit()", "userId", resp.data.userId, "rights", resp.data.rights, "resp token", resp.data.token)
            
            let decodedToken=jwtDecode(resp.data.token)
            let decodedRefreshToken=jwtDecode(resp.data.refreshToken)
            
            //await Kontext.init()
            //Kontext.setUserName(loginForm.loginName.value)
            //Kontext.setUserId(resp.data.userId)
            //Kontext.setJwtToken(resp.data.token)
            //Kontext.setJwtRefreshToken(resp.data.refreshToken)
            //sendEvent('loginOk',{ userName : Kontext.getUserName(), userId : Kontext.getUserId()})
            sendEvent('loginOk',{ rawToken : resp.data.token, 
                decodedToken : decodedToken,
                rawRefreshToken : resp.data.refreshToken, 
                decodedRefreshToken : decodedRefreshToken
             })
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
