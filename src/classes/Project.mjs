import { ApiCaller } from "./ApiCaller.mjs"
import { KanbearEntity } from "./KanbearEntity.mjs"

class Project extends KanbearEntity {

    //------------------------------------------------------------------------
    constructor(project) {
        super('project', project)
        this.project = project
    }

    //-------------------------------------------------------------------------
    async XgetOrderedColumnsList() {

    }

    //-------------------------------------------------------------------------
    async insertColumnAtPos(columnsOrder, columnId, pos) {
        console.log("Project()", "insertColumnAtPos", this, columnId, pos)
        let newColumnsOrder = JSON.parse(columnsOrder)
        newColumnsOrder.splice(pos, 0, columnId)
        this.setData("columns_order", JSON.stringify(newColumnsOrder))
        await this.patch("project", {})
    }

    //-------------------------------------------------------------------------
    async dragColumn(columnsOrder, columnId, dropColId) {

        //let newColumnsOrder = JSON.parse(columnsOrder, (value) => parseInt(value))
        let newColumnsOrder = JSON.parse(columnsOrder)
        console.log("Project()", "drag", columnsOrder, columnId, typeof(columnId), dropColId, typeof(dropColId))
        console.log("Project()", "drag", newColumnsOrder, columnId, dropColId)
        for (let i=0;i<newColumnsOrder.length;i++) {
            console.log("drag",newColumnsOrder[i],typeof(newColumnsOrder[i]))
        }
        let colIdx = newColumnsOrder.indexOf(columnId)
        let insertIdx = newColumnsOrder.indexOf(dropColId)
        console.log("Project()", "drag", "colIdx", colIdx, "insertIdx", insertIdx)

        /*
        newColumnsOrder.splice(insertIdx+1, 0, columnId)
        console.log("Project()", "drag", columnsOrder, newColumnsOrder)
        newColumnsOrder.splice(colIdx+1, 1)
        console.log("Project()", "drag", columnsOrder, newColumnsOrder)
        */

        let newColIdx=newColumnsOrder[colIdx]
        newColumnsOrder.splice(colIdx, 1)
        newColumnsOrder.splice(insertIdx, 0, newColIdx)
        this.setData("columns_order", JSON.stringify(newColumnsOrder))
        await this.patch("project", {})
    }


}

export { Project }
