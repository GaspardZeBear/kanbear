import { Dialog } from './Dialog.mjs'
import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'
import { sendEvent } from '../utils/sendEvent.mjs'
import { Project } from './Project.mjs'
import { colorBoxBuilder, buildColorSelectBox } from '../utils/selectBoxBuilder.mjs'

class ProjectDialog extends Dialog {

    //constructor(dialogName, workspaceId) {
    constructor(dialogName) {
        super('project')
        this.dialogName = dialogName
        this.project = null
    }

    //----------------------------------------------------------------------------
    async fillFormFromDb(project) {
        console.log("ProjectDialog.fillFormFromDb() <project>", project)
        //let projectColor = await buildColorSelectBox(project.color, 'projectColor', 'Project Color')
        //document.getElementById("projectColorDiv").replaceChildren(projectColor)
        projectForm.projectName.value = project.name
        projectForm.projectDescription.value = project.description
        projectForm.projectIsOpen.value = project.is_open
        console.log("ProjectDialog() fillFormIsOpen ", project.is_open)
        if (project.is_open > 0) {
            document.getElementById("projectIsOpen").setAttribute("checked", "")
        }
    }

    //----------------------------------------------------------------------------
    async fillDbFromForm(project) {
        project.setData("name", projectForm.projectName.value)
        project.setData("description", projectForm.projectDescription.value)
        //let color = projectForm.projectColor.value < 0 ? "white" : projectForm.projectColor.value
        //project.setData("color", color)
        project.setName(projectForm.projectName.value)
        project.setDescription(projectForm.projectDescription.value)
        if (projectForm.projectIsOpen.checked) {
            project.setData("is_open", 1)
        } else {
            project.setData("is_open", 0)
        }
        console.log("ProjectDialog() fillDb IsOpen ", projectForm.projectIsOpen.checked)
    }

    //----------------------------------------------------------------------------
    async create(workspaceId) {
        this.workspaceId = workspaceId
        //let projectColor = await buildColorSelectBox('', 'projectColor', 'Project Color')
        //document.getElementById("projectColorDiv").replaceChildren(projectColor)
        this.createDialog(this.save.bind(this))
        this.showDialog("Create project")
    }

    //----------------------------------------------------------------------------
    getProject() {
        return (this.project)
    }
    //-------------------------------------------------------------------------------------
    async save() {
        console.log("processSave() dialog, <name>", projectForm.projectName.value)
        const pr = await KanbearEntityFactory.generate('project')
        pr.setData("workspace_id", this.workspaceId)
        this.fillDbFromForm(pr)
        try {
            let resp = await pr.create()
            this.closeDialog()
            sendEvent("projectCreated", { projectId: pr.getId() })
        } catch (error) {
            this.setMessage(error.cause?.msg)
            this.create(this.workspaceId)
        }
    }

    //----------------------------------------------------------------------------
    async modify(projectId) {
        this.projectId = projectId
        this.project = new Project({ id: projectId })
        try {
            const pr = await this.project.get()
            console.log("ProjectDialog.modify() <pr>", pr)
            await this.fillFormFromDb(pr)
            this.createDialog(this.saveModify.bind(this))
            this.showDialog("Modify project")
        } catch (error) {
            console.log(error)
            this.setMessage(error.cause?.msg)
            this.modify(this.projectId)
        }
    }

    //-------------------------------------------------------------------------------------
    async saveModify() {
        console.log("ProjectDialog.saveModify()")
        this.fillDbFromForm(this.project)
        try {
            let resp = await this.project.patch({})
            this.closeDialog()
            sendEvent("projectModified", { projectId: this.project.getId() })
        } catch (error) {
            this.setMessage(error.cause?.msg)
            this.modify(this.project.id)
        }
    }



}

export { ProjectDialog }