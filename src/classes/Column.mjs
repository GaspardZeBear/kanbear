import { ApiCaller } from "./ApiCaller.mjs"
import { KanbearEntity } from "./KanbearEntity.mjs"
import { KanbearEntityFactory } from "./KanbearEntityFactory.mjs"
import { Columns } from './Columns.mjs'
import { Kontext } from "./Kontext.mjs"

class Column extends KanbearEntity {

    //------------------------------------------------------------------------
    constructor(column) {
        super('column',column)
        this.column = column
    }

    //-------------------------------------------------------------------------------------
    async postCreate(id) {
        console.log("Column.postCreate()","fired","id",id)

        // update project
        // projectId comes from columns
        // insert columnId at first place in projectOrder

        const colEntity = await KanbearEntityFactory.generate('column')
        colEntity.setId(id)
        const col=await colEntity.get('column', {})
        console.log("Column.postCreate()","col", col)
        let projectEntity=await KanbearEntityFactory.generate('project')
        projectEntity.setId(col.project_id)
        const project=await projectEntity.get('project', {})
        projectEntity.insertColumnAtPos(project.columns_order,id,0)
               
    }

    //-------------------------------------------------------------------------------------
    async postPatch(data) {
        console.log("Column.postPatch()","fired","id",this.id,"data",data)
    }

    //-------------------------------------------------------------------------------------
    async postDelete(data) {
        console.log("Column.postDelete()","fired","id",this.id,"data",data)
    }

}

export { Column }
