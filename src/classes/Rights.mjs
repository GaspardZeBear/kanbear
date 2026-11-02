import { ApiCaller } from "./ApiCaller.mjs"
import { KanbearEntity } from "./KanbearEntity.mjs"

class Rights extends KanbearEntity {

    //------------------------------------------------------------------------
    constructor(params) {
        super('rights')
        this.targetId = params.targetId ?? null
        this.targetKind = params.targetKind ?? null
        this.ownerId = params.ownerId ?? null
        this.ownerType = params.ownerType ?? null
    }

    //-------------------------------------------------------------------------------
    async getByUserId() {
        console.log("WorkspacesRights.getByUserId())")
        let params={}
        const resp = await new ApiCaller().get(`/api/rights/user/${this.ownerId}`, params)
        console.log("Rights.getByUserId())", resp.data)
        return (resp.data)
    }

    //-------------------------------------------------------------------------------
    async getByGroupId() {
        console.log("WorkspacesRights.getByGroupId())")
        let params={}
        const resp = await new ApiCaller().get(`/api/rights/group/${this.ownerId}`, params)
        console.log("Rights.getByUserId())", resp.data)
        return (resp.data)
    }
}

export { Rights }
