import { ApiCaller } from "./ApiCaller.mjs"
import { KanbearEntity } from "./KanbearEntity.mjs"

class UsersGroups extends KanbearEntity {

    //------------------------------------------------------------------------
    constructor(usersGroups) {
        super('usersGroups',usersGroups)
        this.usersGroups = usersGroups
    }

//-------------------------------------------------------------------------------
    static XgetByGroupId(params) {
        console.log("KanbearEntity.getByGroupId())","<params>",params)
        //const resp = new ApiCaller().get(`/api/users_groups/group/${params["groupId"]}`, params)
        //let resp = { data : null}
        return new ApiCaller().get(`/api/users_groups/group/${params["groupId"]}`, params)
        .then ( (resp) => { 
            console.log("KanbearEntity.getByGroupId then ",resp)
            return(resp.data)
        })
        .finally( () => {
            console.log("KanbearEntity.getByGroupId finally ")}
        )
        console.log("KanbearEntity.getByGroupId())", resp.data)
        return (resp.data)
    }

//-------------------------------------------------------------------------------
    static async getUsersByGroupId(params) {
        console.log("KanbearEntity.getByGroupId())","<params>",params)
        //const resp = new ApiCaller().get(`/api/users_groups/group/${params["groupId"]}`, params)
        //let resp = { data : null}
        const resp =  await new ApiCaller().get(`/api/groups/users/${params["groupId"]}`, params)
        console.log("KanbearEntity.getByGroupId())", resp.data)
        return (resp.data)
    }



}

export { UsersGroups }
