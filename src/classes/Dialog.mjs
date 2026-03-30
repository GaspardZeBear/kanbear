import { KanbearEntity } from "./KanbearEntity.mjs"

class Dialog {

    //static clickListeners=[]

    //------------------------------------------------------------------------
    constructor(kind) {
        this.kind=kind
        this.upperFirstKind=this.kind.charAt(0).toUpperCase() + this.kind.slice(1)
        this.dialog = null
        //console.log("Dialog clickListeners before",Dialog.clickListeners)
       // for ( let listenerFunction of Dialog.clickListeners) {
        //    console.log("Dialog clickListeners remove ",listenerFunction)
        //    removeEventListener("click",listenerFunction)
        //}
        //Dialog.clickListeners=[]
        //console.log("Dialog clickListeners after",Dialog.clickListeners)
    }

    showDialog() {
        console.log("dialog",this.dialog)
        this.dialog.showModal();
    }

    closeDialog() {
        console.log("closeDialog()", this.dialog)
        console.log("close clickListeners",Dialog.clickListeners)
        this.dialog.close();
    }

    //-------------------------------------------------------------------------------------
    createDialog() {
        this.dialog = document.getElementById(this.kind+"Dialog")
        let dialog = this.dialog
        let close = this.closeDialog.bind(this)
        let save = this.save.bind(this)
        //document.getElementById("projectNameDiv").setAttribute("hidden","")
        let saveBtnId="save"+this.upperFirstKind+"Btn"
        console.log("create savefn")
        let saveFn=async function (event) {
            console.log("eventListener ",saveBtnId," dialog")
            console.log("eventListener ",save)
            await save()
        }
        //Dialog.clickListeners.push(saveFn)
        //console.log("createDialog() saveListeners after push",Dialog.clickListeners)
        //removeEventListener("click",saveFn)
        document.getElementById(saveBtnId).addEventListener("click", saveFn, {once: true});

        let cancelBtnId="cancel"+this.upperFirstKind+"Btn"
        let cancelFn=function (event) {
            console.log("eventListener",cancelBtnId,"dialog")
            close();
        }
        //Dialog.clickListeners.push(cancelFn)
        //removeEventListener("click",cancelFn)
        document.getElementById(cancelBtnId).addEventListener("click", cancelFn, { once:true} );
    }



}

export {Dialog }