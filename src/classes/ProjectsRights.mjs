import { ApiCaller } from "./ApiCaller.mjs"
import { KanbearEntity } from "./KanbearEntity.mjs"

class ProjectsRights extends KanbearEntity {

    //------------------------------------------------------------------------
    constructor(params) {
        super('projectsRights')
        this.projectId = params.projectId ?? null
        this.ownerId = params.ownerId ?? null
    }

    //-------------------------------------------------------------------------------
    async getByUserId() {
        console.log("ProjectsRights.getByUserId()) ownerId",this.ownerId)
        let params={}
        const resp = await new ApiCaller().get(`/api/rights/user/${this.ownerId}`, params)
        console.log("ProjectsRights.getByUserId())", resp.data)
        return (resp.data)
    }
}

export { ProjectsRights }
