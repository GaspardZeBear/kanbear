import { Dialog } from './Dialog.mjs'
import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'
import { sendEvent } from '../utils/sendEvent.mjs'
import { Swimlane } from './Swimlane.mjs'

class SwimlaneDialog extends Dialog {

    constructor(dialogName) {
        super('swimlane')
        this.dialogName = dialogName
        this.swimlane = null
    }

    //----------------------------------------------------------------------------
    async fillFormFromDb(swimlane) {
        console.log("swimlaneDialog.fillFormFromDb() swimlane>", swimlane)
        //let projectColor = await buildColorSelectBox(project.color, 'projectColor', 'Project Color')
        //document.getElementById("projectColorDiv").replaceChildren(projectColor)
        swimlaneForm.swimlaneName.value = swimlane.name
        swimlaneForm.swimlaneDescription.value = swimlane.description
        swimlaneForm.swimlaneIsOpen.value = swimlane.is_open
        console.log("SwimlaneDialog() fillFormIsOpen ", swimlane.is_open)
        if (swimlane.is_open > 0) {
            document.getElementById("swimlaneIsOpen").setAttribute("checked", "")
        }
    }

    //----------------------------------------------------------------------------
    async fillDbFromForm(swimlane) {
        swimlane.setData("name", swimlaneForm.swimlaneName.value)
        swimlane.setData("description", swimlaneForm.swimlaneDescription.value)
        //let color = projectForm.projectColor.value < 0 ? "white" : projectForm.projectColor.value
        //project.setData("color", color)
        swimlane.setName(swimlaneForm.swimlaneName.value)
        swimlane.setDescription(swimlaneForm.swimlaneDescription.value)
        if (swimlaneForm.swimlaneIsOpen.checked) {
            swimlane.setData("is_open", 1)
        } else {
            swimlane.setData("is_open", 0)
        }
        console.log("SwimlaneDialog() fillDb IsOpen ", swimlaneForm.swimlaneIsOpen.checked)
    }


    //----------------------------------------------------------------------------
    create(projectId) {
        console.log("Swimlane.create() dialog, for  <projectId>",projectId)
        this.projectId = projectId
        this.createDialog(this.save.bind(this))
        this.showDialog("Create swimlane")
    }

    //-------------------------------------------------------------------------------------
    async save() {
        console.log("Swimlane.save() dialog, <name>", swimlaneForm.swimlaneName.value)
        const sw = await KanbearEntityFactory.generate('swimlane')
        sw.setData("project_id", this.projectId)
        this.fillDbFromForm(sw)
        try {
            let resp = await sw.create()
            this.closeDialog()
            sendEvent("swimlaneCreated", { swimlaneId: sw.getId() })
        } catch (error) {
            this.setMessage(error.cause?.msg)
            this.create(this.swimlaneId)
        }
    }

    //----------------------------------------------------------------------------
    async modify(swimlaneId) {
        this.swimlaneId = swimlaneId
        this.swimlane = new Swimlane({ id: swimlaneId })
        try {
            const sw = await this.swimlane.get()
            console.log("SwimlaneDialog.modify() <sw>", sw)
            await this.fillFormFromDb(sw)
            this.createDialog(this.saveModify.bind(this))
            this.showDialog("Modify swimlane")
        } catch (error) {
            console.log(error)
            this.setMessage(error.cause?.msg)
            this.modify(this.swimlaneId)
        }
    }

    //-------------------------------------------------------------------------------------
    async saveModify() {
        console.log("SwimlaneDialog.saveModify()")
        this.fillDbFromForm(this.swimlane)
        try {
            let resp = await this.swimlane.patch({})
            this.closeDialog()
            sendEvent("swimlaneModified", { swimlane: this.swimlane.getId() })
        } catch (error) {
            console.log(error)
            this.setMessage(error.cause?.msg)
            this.modify(this.swimlane.id)
        }
    }


}

export { SwimlaneDialog }