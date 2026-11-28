import { ApiCaller } from "./ApiCaller.mjs"
import { KanbearEntity } from "./KanbearEntity.mjs"

class Project extends KanbearEntity {

    //------------------------------------------------------------------------
    constructor(project) {
        super('project', project)
        this.project = project
    }

    //-------------------------------------------------------------------------
    async resetColumnsOrder(jsonColumnsOrder) {
        console.log("Project() restColumnsOrder", jsonColumnsOrder)
        //this.data.jsonColumnsOrder=JSON.stringify(jsonColumnsOrder)
        this.setData("columns_order", JSON.stringify(jsonColumnsOrder))
        this.patch()
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

//-------------------------------------------------------------------------
    async resetSwimlanesOrder(jsonSwimlanesOrder) {
        console.log("Project$ resetSwimlanesOrder", jsonSwimlanesOrder)
        //this.data.jsonColumnsOrder=JSON.stringify(jsonColumnsOrder)
        this.setData("swimlanes_order", JSON.stringify(jsonSwimlanesOrder))
        this.patch()
    } 
    
    //-------------------------------------------------------------------------
    async insertSwimlaneAtPos(swimlanesOrder, swimlaneId, pos) {
        console.log("Project$ insertSwimlaneAtPos()", swimlanesOrder, swimlaneId, pos)
        let newSwimlanesOrder = JSON.parse(swimlanesOrder)
        newSwimlanesOrder.splice(pos, 0, swimlaneId)
        console.log("Project$ insertSwimlaneAtPos() newSwimlanesOrder", newSwimlanesOrder)
        this.setData("swimlanes_order", JSON.stringify(newSwimlanesOrder))
        await this.patch("project", {})
    }


    //-------------------------------------------------------------------------
    async dragSwimlane(swimlanesOrder, swimlaneId, dropSwId) {

        //let newColumnsOrder = JSON.parse(columnsOrder, (value) => parseInt(value))
        let newSwimlanesOrder = JSON.parse(swimlanesOrder)
        console.log("Project$ dragSwimlane()", swimlanesOrder, swimlaneId, typeof(swimlaneId), dropSwId, typeof(dropSwId))
        console.log("Project$ dragSwimlane()", newSwimlanesOrder, swimlaneId, dropSwId)
        for (let i=0;i<newSwimlanesOrder.length;i++) {
            console.log("Project dragSwimlane()",newSwimlanesOrder[i],typeof(newSwimlanesOrder[i]))
        }
        let swIdx = newSwimlanesOrder.indexOf(swimlaneId)
        let insertIdx = newSwimlanesOrder.indexOf(dropSwId)
        console.log("Project$ dragSwimlane()", "swIdx", swIdx, "insertIdx", insertIdx)
        let newSwIdx=newSwimlanesOrder[swIdx]
        newSwimlanesOrder.splice(swIdx, 1)
        newSwimlanesOrder.splice(insertIdx, 0, newSwIdx)
        console.log("Project$ dragSwimlane() JSON",JSON.stringify(newSwimlanesOrder))
        this.setData("swimlanes_order", JSON.stringify(newSwimlanesOrder))
        await this.patch("project", {})
    }


}

export { Project }
