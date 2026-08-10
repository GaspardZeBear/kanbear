import { ApiCaller } from "./ApiCaller.mjs"
import { KanbearEntity } from "./KanbearEntity.mjs"

class ProjectsRights extends KanbearEntity {

    //------------------------------------------------------------------------
    constructor(params) {
        super('projectsRights')
        this.projectId = params.projectId ?? null
        this.userId = params.userId ?? null
    }

    //-------------------------------------------------------------------------------
    async getByUserId() {
        console.log("ProjectsRights.getByUserId())")
        let params={}
        const resp = await new ApiCaller().get(`/api/projects_rights/user/${this.userId}`, params)
        console.log("ProjectsRights.getByUserId())", resp.data)
        return (resp.data)
    }
}

export { ProjectsRights }
