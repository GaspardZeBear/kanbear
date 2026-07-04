//import { ApiCaller } from "./ApiCaller.mjs"

import { Column } from "./Column.mjs"
import { Kontext } from "./Kontext.mjs"
import { sendEvent } from "../utils/sendEvent.mjs"
import { KanbearEntityFactory } from "./KanbearEntityFactory.mjs"

class Columns {

    //------------------------------------------------------------------------
    constructor() {
        console.log("Columns constructor ")
        this.buildOrderedList()
    }

    //------------------------------------------------------------------------
    getOrderedList() {
        return (this.sortedColumnsList)
    }

    //------------------------------------------------------------------------
    buildOrderedList() {
        console.log("Columns. buildOrderedList()")
        const projectId = Object.keys(Kontext.getJsonBulkData())[0]
        let columnsList = []

        let columnsHash = {}
        Object.entries(Kontext.getJsonBulkData()[projectId].columns).forEach(([key, col]) => {
            columnsList.push(col)
            columnsHash[col.id] = true
        })
        console.log("Columns.buildOrdredList()", "Non-ordered", columnsList)
        this.sortedColumnsList = []

        // columnist is a chain of columns
        // columnHash keys are columnIds 
        // nobody point to the first of chain
        // So, if a pointer exists, remove the pointed col from columnHash
        for (let col of columnsList) {
            console.log("xxx", "columnsHash", Object.keys(columnsHash).length, columnsHash)
            if (Object.keys(columnsHash).length == 1) {
                break
            }
            if (col.nextColumnId in columnsHash && col.nextColumnId > 0) {
                delete (columnsHash[col.nextColumnId])
            }
        };
        console.log("xxx", "columnsHash final", columnsHash)
        let firstColumnId = Object.keys(columnsHash)[0]


        let columns = Kontext.getJsonBulkData()[projectId].columns

        // let's establish a forward chain starting from first column
        // and backward chain

        let key = firstColumnId
        let prevColumnId = 0
        for (let i = 0; columnsList.length; i++) {
            console.log("xxx", "columns[key]", columns[key])
            columns[key].prevColumnId = prevColumnId
            this.sortedColumnsList.push(columns[key])
            if (columns[key].nextColumnId > 0) {
                key = columns[key].nextColumnId
                prevColumnId = columns[key].id
            } else {
                break
            }

        }
        console.log("xxx", "first", firstColumnId)
        console.log("Columns.buildOrdredList()", "ordered", this.sortedColumnsList)
        //this.columns = await Column.getAll('columns', {projectId:projectId})
    }

    //------------------------------------------------------------------------
    getColumn(index) {
        //this.buildOrderedList()
        let column = null
        if (this.sortedColumnsList.length > index) {
            column = this.sortedColumnsList[index]
        }
        return (column)
    }

    //-----------------------------------------------------------------------
    async _getColumn(label, id, mayFail = false) {
        console.log("Columns.getColumn() called", label, id)
        let result = { entity: null, values: null }
        try {
            result.entity = await KanbearEntityFactory.generate('column')
            result.entity.setId(id)
            result.values = await result.entity.get('column', {})
            console.log("Columns.getColumn() result", label, id, result)
            return (result)
        } catch (error) {
            if (mayFail) {
                return(result)
            } else {
                throw(error)
            }
        };

    }

    //------------------------------------------------------------------------
    // insert column columnId after column dropColumId
    async drag(columnId, dropColumnId) {
        if (columnId == dropColumnId) {
            console.log("Drop", "col and dropCol identical")
            return
        }
        //let colEntity = await KanbearEntityFactory.generate('column')
        //colEntity.setId(columnId)
        //let col = await colEntity.get('column', {})
        //console.log("Columns.drag()", "col", col)
        let col = await this._getColumn("col", columnId)


        //let colNextEntity = await KanbearEntityFactory.generate('column')
        //colNextEntity.setId(col.next_column_id)
        //let colNext = await colNextEntity.get('column', {})
        //console.log("Columns.drag()", "colNext", colNext)
        let colNext = await this._getColumn("colNext", col.values.next_column_id)


        //let dropColEntity = await KanbearEntityFactory.generate('column')
        //dropColEntity.setId(dropColumnId)
        //let dropCol = await dropColEntity.get('column', {})
        //console.log("Columns.drag()", "dropCol", dropCol)
        let dropCol = await this._getColumn("colNext", dropColumnId)


        //let dropColNextEntity = await KanbearEntityFactory.generate('column')
        //dropColNextEntity.setId(dropColumnId.next_column_id)
        //let dropColNext = await dropColNextEntity.get('column', {})
        //console.log("Columns.drag()", "dropColNext", dropColNext)
        let dropColNext = await this._getColumn("dropColNext", dropColumnId.next_column_id, true)

        colNext.entity.setData("prev_column_id", col.values.prev_column_id)
        col.entity.setData("next_column_id", dropCol.values.next_column_id)
        dropCol.entity.setData("next_column_id", col.values.id)
        dropColNext.values ? dropColNext.entity.setData("prev_column_id", col.values.id) : 0
        col.entity.setData("prev_column_id", dropCol.values.prev_column_id)


        await col.entity.patch("columns", {})
        await colNext.entity.patch("columns", {})
        await dropCol.entity.patch("columns", {})
        dropColNext.values ? dropColNext.entity.patch("columns", {}) : 0
        sendEvent(`columnDragged`, {})

    }


}

export { Columns }
