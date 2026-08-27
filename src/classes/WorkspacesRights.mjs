import { ApiCaller } from "./ApiCaller.mjs"
import { KanbearEntity } from "./KanbearEntity.mjs"

class WorkspacesRights extends KanbearEntity {

    //------------------------------------------------------------------------
    constructor(params) {
        super('workspacesRights')
        this.workspaceId = params.workspaceId ?? null
        this.userId = params.userId ?? null
    }

    //-------------------------------------------------------------------------------
    async getByUserId() {
        console.log("WorkspacesRights.getByUserId())")
        let params={}
        const resp = await new ApiCaller().get(`/api/workspaces_rights/user/${this.userId}`, params)
        console.log("WorkspacesRights.getByUserId())", resp.data)
        return (resp.data)
    }
}

export { WorkspacesRights }
