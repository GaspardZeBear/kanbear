import { ApiCaller } from "./ApiCaller.mjs"
import { KanbearEntity } from "./KanbearEntity.mjs"
import { KanbearEntityFactory } from "./KanbearEntityFactory.mjs"

class Swimlane extends KanbearEntity {

    //------------------------------------------------------------------------
    constructor(swimlane) {
        super('swimlane',swimlane)
        this.swimlane = swimlane
    }

    //-------------------------------------------------------------------------------------
    async postCreate(id) {
        console.log("Swimlane.postCreate()","fired","id",id)

        // update project
        // projectId comes from columns
        // insert columnId at first place in projectOrder

        const swEntity = await KanbearEntityFactory.generate('swimlane')
        swEntity.setId(id)
        const sw=await swEntity.get('swimlane', {})
        console.log("Swimlane.postCreate()","sw", sw)
        let projectEntity=await KanbearEntityFactory.generate('project')
        projectEntity.setId(sw.project_id)
        const project=await projectEntity.get('project', {})
        projectEntity.insertSwimlaneAtPos(project.swimlanes_order,id,0)
               
    }


}

export { Swimlane }
