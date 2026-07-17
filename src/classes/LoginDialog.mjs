import { sendEvent } from '../utils/sendEvent.mjs'

class LoginDialog {

    constructor(dialogName) {
        //super('login')
        this.dialogName = dialogName
         this.dialog = document.getElementById("loginDialog")
        //this.user = null
    }

    //----------------------------------------------------------------------------
    async create(params={}) {
        //this.workspaceId = workspaceId
        this.params=params
        this.createDialog()
        this.dialog.showModal();
    }

    //-------------------------------------------------------------------------------------
    async submit() {
        console.log("LoginDialog.save() dialog")
        try {
            //this.closeDialog()
            //let eventId=`LoId`
            //sendEvent(`LoginDone`, { [eventId] : entity.getId() })
            console.log("LoginDialog.save() <sendEvent>")
        } catch (error) {
            console.log("LoginDialog.save() <error>",error)
        }
    }


    //----------------------------------------------------------------------------
    createDialog() {
        console.log("LoginDialog.createDialog() ")
       
        let dialog = this.dialog
        dialog.setAttribute("closedby","none")
        let close = this.closeDialog.bind(this)
        //let save = this.save.bind(this)

        //document.getElementById("projectNameDiv").setAttribute("hidden","")
        let submitBtnId="submitLoginBtn"
        let submit=this.submit
        let submitFn=async function (event) {
            await submit()
            close()
        }
        console.log("Dialog.createDialog <saveBtn>",document.getElementById(submitBtnId))
        document.getElementById(submitBtnId).addEventListener("click", submitFn, {once: true});
        //document.getElementById(saveBtnId).addEventListener("mouseover", () => {console.log("Mouseover")});

        let cancelBtnId="cancelLoginBtn"
        let cancel = this.cancelDialog.bind(this)
        let cancelFn=function (event) {
            console.log("eventListener",cancelBtnId,"dialog")
            cancel();
        }
        document.getElementById(cancelBtnId).addEventListener("click", cancelFn, { once:true} );
    }

        //------------------------------------------------------------------------------------------------
    closeDialog() {
        console.log("closeDialog()", this.dialog)
        this.dialog.close();
    }

    //-------------------------------------------------------------
    cancelDialog() {
        sendEvent("dialogCanceled", {})
        this.closeDialog();
    }

    
}

export { LoginDialog }
