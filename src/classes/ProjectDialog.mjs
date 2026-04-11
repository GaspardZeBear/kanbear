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
    async subCreate(params) {
        console.log("ProjectDialog.subCreate() <params>", params)
        this.workspaceId = params["workspaceId"]
    }

    //----------------------------------------------------------------------------
    getProject() {
        return (this.project)
    }

    //-------------------------------------------------------------------------------------
    async subSave(pr) {
        console.log("processSave() dialog, <name>", projectForm.projectName.value)
        //const pr = await KanbearEntityFactory.generate('project')
        pr.setData("workspace_id", this.workspaceId)
        this.fillDbFromForm(pr)
    }

    //----------------------------------------------------------------------------
    async subModify(params) {
        console.log("ProjectDialog.subModify() <params>", params)
        return( params["projectId"])
    }

}

export { ProjectDialog }