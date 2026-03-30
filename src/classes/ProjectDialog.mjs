import { Dialog } from './Dialog.mjs'

class ProjectDialog extends Dialog {

    constructor(dialogName, workspaceId) {
        super()
        this.dialogName = dialogName
        this.workspaceId = workspaceId
        this.buildHtmlDialog()
        //console.log("ProjectDialog.constructor() ",this.dialogId)
        //this.dialog = document.getElementById(this.dialogId);
        this.showDialog()
    }

    //------------------------------------------------------------------------------------------
    buildHtmlDialog() {
        switch (this.dialogName) {
            case "create":
                this.createDialog()
                break
            default:
                console.log("ProjectDialog.buildHtmlDialog() unknown dialogName ", this.dialogName)
        }
    }

    //-------------------------------------------------------------------------------------
    createDialog() {
        this.dialog = document.getElementById("projectDialog")
        let dialog = this.dialog
        let close = this.closeDialog.bind(this)
        let save = this.save.bind(this)
        //document.getElementById("projectNameDiv").setAttribute("hidden","")
        document.getElementById("saveProjectBtn").addEventListener("click", function (event) {
            //console.log("eventListener submitBtn dialog", dialog)
           //console.log("dialog", dialog)
            //console.log("dialog, field name", projectForm.name.value)
            //console.log("clicked", event.target.name)
            //close();
            save()
        });
        document.getElementById("cancelProjectBtn").addEventListener("click", function (event) {
            console.log("eventListener cancelBtn dialog")
            close();
        });
    }

    //-------------------------------------------------------------------------------------
    save() {
        console.log("processSave() dialog, field name", projectForm.name.value)
        this.closeDialog()
    }

    //-------------------------------------------------------------------------------------------
    XcreateDialog() {
        let dialogDiv = document.createElement("div")
        let dialog = document.createElement("dialog")
        dialog.setAttribute("id", "createProject")
        this.dialogId = "createProject"
        dialog.setAttribute("closedby", "any")
        let form = document.createElement("form")
        form.setAttribute("id", "createProjectForm")
        form.setAttribute("method", "dialog")
        let nameDiv = document.createElement("div")
        let label = document.createElement("label")
        label.setAttribute("for", "name")
        let input = document.createElement("input")
        input.setAttribute("type", "text")
        input.setAttribute("id", "projectName")
        let saveBtn = document.createElement("button")
        saveBtn.setAttribute("type", "button")
        saveBtn.setAttribute("id", "saveProjectBtn")
        saveBtn.innerHTML = "Save"
        let cancelBtn = document.createElement("button")
        cancelBtn.setAttribute("type", "button")
        cancelBtn.setAttribute("id", "cancelProjectBtn")
        cancelBtn.setAttribute("onclick", '"close()"')
        cancelBtn.innerHTML = "Cancel"

        nameDiv.append(label)
        nameDiv.append(input)
        form.append(nameDiv)
        form.append(saveBtn)
        form.append(cancelBtn)
        dialog.append(form)
        dialogDiv.append(dialog)
        document.getElementById("modal").append(dialogDiv)
        this.dialogDiv = dialogDiv
        console.log("dialogDiv", dialogDiv)
        let close = this.closeDialog.bind(this)
        document.getElementById("saveProjectBtn").addEventListener("click", function (event) {
            console.log("eventListener submitBtn dialog", dialog)
            console.log("dialog", dialog)
            console.log("dialog, field name", createProjectForm.name.value)
            console.log("clicked", event.target.name)
            close();
        });

        document.getElementById("cancelProjectBtn").addEventListener("click", function (event) {
            console.log("eventListener cancelBtn dialog", dialog)
            close();
        });
    }



}

export { ProjectDialog }