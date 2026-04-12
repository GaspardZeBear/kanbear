import { KanbearEntity } from "./KanbearEntity.mjs"
import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'
import { sendEvent } from "../utils/sendEvent.mjs"

class Dialog {

    //static clickListeners=[]

    //------------------------------------------------------------------------
    constructor(kind) {
        this.kind=kind
        this.upperFirstKind=this.kind.charAt(0).toUpperCase() + this.kind.slice(1)
        this.dialog = null
    }

    //----------------------------------------------------------------------------
    async create(params={}) {
        //this.workspaceId = workspaceId
        this.params=params
        await this.subCreate(params)
        this.createDialog(this.save.bind(this))
        this.showDialog("Create New "+this.kind)
    }

    //-------------------------------------------------------------------------------------
    async save() {
        console.log("Dialog.save() dialog, <name>")
        const entity = await KanbearEntityFactory.generate(this.kind)
        await this.subSave(entity)
        //pr.setData("workspace_id", this.workspaceId)
        //this.fillDbFromForm(pr)
        try {
            let resp = await entity.create()
            this.closeDialog()
            let eventId=`${this.kind}Id`
            sendEvent(`${this.kind}Created`, { [eventId] : entity.getId() })
        } catch (error) {
            this.setMessage(error.cause?.msg)
            this.create(this.params)
        }
    }

    //----------------------------------------------------------------------------
    async modify(params) {
        this.params=params
        //this.projectId = projectId
        try {
            //this.project = new Project({ id: projectId })
            this.entity = await KanbearEntityFactory.generate(this.kind)
            let id=await this.subModify(params)
            this.entity.setId(id)
            console.log("Dialog.modify() this.entity",this.entity)
            this.entity[this.kind] = await this.entity.get()
            
            await this.fillFormFromDb(this.entity[this.kind])
            console.log("Dialog.modify() <entity>", this.entity)
            //console.log("Dialog.modify() <ent>", this.ent)
            this.createDialog(this.saveModify.bind(this))
            this.showDialog("Modify " + this.kind )
        } catch (error) {
            console.log(error)
            this.setMessage(error.cause?.msg)
            //this.modify(this.params)
        }
    }

    //-------------------------------------------------------------------------------------
    async saveModify() {
        console.log("Dialog.saveModify() <this.ent>",this.ent)
        this.fillDbFromForm(this.entity)
        try {
            let resp = await this.entity.patch({})
            this.closeDialog()
            //sendEvent("projectModified", { projectId: this.project.getId() })
            let eventId=`${this.kind}Id`
            let eventName=`${this.kind}Name`
            sendEvent(`${this.kind}Modified`, { [eventId] : this.entity.getId(), [eventName] : this.entity.getName()  })
        } catch (error) {
            console.log("Dialog.saveModify() error", error)
            this.setMessage(error.cause?.msg)
            this.modify(this.params)
        }
    }

    //------------------------------------------------------------------------------------------
    setMessage(message) {
        document.getElementById(`${this.kind}DialogMessage`).innerHTML=message
    }

    //------------------------------------------------------------------------------------------
    showDialog(title="No title") {
        document.getElementById(`${this.kind}DialogTitle`).innerHTML=title
        this.dialog.showModal();
    }

    //------------------------------------------------------------------------------------------------
    closeDialog() {
        console.log("closeDialog()", this.dialog)
        console.log("close clickListeners",Dialog.clickListeners)
        this.dialog.close();
    }

    //-------------------------------------------------------------
    cancelDialog() {
        sendEvent("dialogCanceled", {})
        this.closeDialog();
    }


     //-------------------------------------------------------------------------------------
     // Build event listener on "Save" and "cancel" buttons, accordind to the action (create, modify etc..)
    createDialog(save=()=>{}) {
        this.dialog = document.getElementById(this.kind+"Dialog")
        let dialog = this.dialog
        let close = this.closeDialog.bind(this)
        //let save = this.save.bind(this)

        //document.getElementById("projectNameDiv").setAttribute("hidden","")
        let saveBtnId="save"+this.upperFirstKind+"Btn"
        console.log("Dialog.createDialog() create savefn function for <saveBtnId>", saveBtnId)
        let saveFn=async function (event) {
        //    console.log("eventListener ",saveBtnId," dialog")
        //    console.log("eventListener ",save)
            await save()
        }
        //Dialog.clickListeners.push(saveFn)
        //console.log("createDialog() saveListeners after push",Dialog.clickListeners)
        //removeEventListener("click",saveFn)
        console.log("Dialog.createDialog <saveBtn>",document.getElementById(saveBtnId))
        document.getElementById(saveBtnId).addEventListener("click", saveFn, {once: true});
        //document.getElementById(saveBtnId).addEventListener("mouseover", () => {console.log("Mouseover")});

        let cancelBtnId="cancel"+this.upperFirstKind+"Btn"
        let cancel = this.cancelDialog.bind(this)
        let cancelFn=function (event) {
            console.log("eventListener",cancelBtnId,"dialog")
            cancel();
        }
        //Dialog.clickListeners.push(cancelFn)
        //removeEventListener("click",cancelFn)
        document.getElementById(cancelBtnId).addEventListener("click", cancelFn, { once:true} );
        //document.getElementById(cancelBtnId).addEventListener("mouseover", () => {console.log("Mouseover cancel")});
    }



}

export {Dialog }