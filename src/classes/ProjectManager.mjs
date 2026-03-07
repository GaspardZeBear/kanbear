import { Kontext } from "./Kontext.mjs"

class ProjectManager {

    constructor(project) {
        this.project = project
        //this.openPopup()
    }

    //----------------------------------------------------------------
    isDisplayable() {
        console.log("ProjectManager", this.project)
        if (!this.project) return ([false, "Not exists"])
        console.log("ProjectManager", "exist !")
        if (!Kontext.getJsonBulkData()[this.project.id]) return ([false, "Not loaded"])
        console.log("ProjectManager", "is in Bulk")
        if (!this.project.swimlanes) return ([false, "No Swimlanes"])
        console.log("ProjectManager", "has swimlanes")
        return ([true,"Validated"])
    }

}
export { ProjectManager }