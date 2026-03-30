import { KanbearEntity } from "./KanbearEntity.mjs"

class Dialog {

    //------------------------------------------------------------------------
    constructor() {
        this.dialog = null
    }

    showDialog() {
        console.log("dialog",this.dialog)
        this.dialog.showModal();
    }

    closeDialog() {
        console.log("closeDialog()", this.dialog)
        this.dialog.close();
    }



}

export {Dialog }