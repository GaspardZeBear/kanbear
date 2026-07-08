//import { ApiCaller } from "./ApiCaller.mjs"

import { Column } from "./Column.mjs"
import { Kontext } from "./Kontext.mjs"
import { sendEvent } from "../utils/sendEvent.mjs"
import { KanbearEntityFactory } from "./KanbearEntityFactory.mjs"

class Columns {

    //------------------------------------------------------------------------
    constructor(parms = {}) {
        console.log("Columns constructor ", "columnsHash", parms)
        this.columnsHash = parms.columnsHash
        this.sortedColumnsList = parms.columnsList
        if (parms.columnsHash) {
            this.columnsHash = parms.columnsHash
            this.columns = []
            Object.entries(this.columnsHash).forEach(([key, col]) => {
                this.columns.push(col)
            })
            console.log("Columns.buildOrderedList()", "Non-ordered columnList", this.columns)
            this.buildOrderedList()
        }
    }

    //------------------------------------------------------------------------
    getOrderedList() {
        return (this.sortedColumnsList)
    }

    //------------------------------------------------------------------------
    XXbuildOrderedList() {
        const projectId = Object.keys(Kontext.getJsonBulkData())[0]
        this.sortedColumnsList = []
        Object.entries(Kontext.getJsonBulkData()[projectId].columns).forEach(([key, col]) => {
            this.sortedColumnsList.push(col)
        })
        //this.buildOrderedListN()
    }

    //------------------------------------------------------------------------
    buildOrderedList() {
        try {
            const firstColumn = this.columns.find(col => col.prevColumnId === 0);
            if (!firstColumn) {
                throw new Error("Not starting col found");
            }

            const sortedColumnsList = [];
            let currentCol = firstColumn;
            let maxLoop = this.columns.length
            let loops = 0
            while (currentCol) {
                sortedColumnsList.push(currentCol);
                // Trouver le nœud suivant
                console.log("Columns.buildOrderedList()", "currentCol", currentCol)
                currentCol = this.columns.find(col => col.id === currentCol.nextColumnId);
                loops++
                if (loops > maxLoop) {
                    console.log("Columns.buildOrderedList()", "excessive loop count")
                    throw "excessive loop count"
                }
            }
            this.sortedColumnsList = sortedColumnsList
            console.log("Columns.buildOrderedList()", "over normally ", this.sortedColumnsList)
        } catch (error) {
            this.columns = []
            console.log("Columns.buildOrderedList()", "error", error, "no ordered list")
            Object.entries(this.columnsHash).forEach(([key, col]) => {
                this.columns.push(col)
            })
            this.sortedColumnsList = this.columns
        }
    }

    //------------------------------------------------------------------------
    chainFromScratch(index) {
        let columns = Kontext.getJsonBulkData()[projectId].columns
        console.log("Columns.chainFromScratch()", "ordered", columns)
        let prevIndex = 0
        columns[0].prevColumnId = 0
        for (let i = 1; i < columns.length; i++) {
            columns[prevIndex].nextColumnId = columns[i].id
            columns[i].prevColumnId = columns[prevIndex].id
            prevIndex++
        }
        columns[columns.length].nextColumnId = 0
        this.sortedColumnsList = []
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
                return (result)
            } else {
                throw (error)
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


        // - - - - - - -
        // Chain is currently  ...| col | colnext | ... | dropCol | dropColNext | ...
        // dropColNext may not exist
        // col must be inserted just after dropCol
        // Chain will become   ...| colnext | ... | dropCol | col | dropColNext | ...
        // - - - - - - - 
        let col = await this._getColumn("col", columnId)
        let colNext = await this._getColumn("colNext", col.values.next_column_id)
        let dropCol = await this._getColumn("dropCol", dropColumnId)
        let dropColNext = await this._getColumn("dropColNext", dropCol.values.next_column_id, true)
        // Insert col between dropCol and dropColNext : ppint backward to dropCol, and forward to what dropCol pointed forward to
        col.entity.setData("prev_column_id", dropColumnId)
        col.entity.setData("next_column_id", dropCol.values.next_column_id)
        // colNext must point backward to what col was pointing backward to
        // colNext forward pointer has not to be changed
        colNext.entity.setData("prev_column_id", col.values.prev_column_id)
        // dropCol must point forward to col
        // dropCol backward pointer has not to be changed
        dropCol.entity.setData("next_column_id", columnId)
        // if there was a dropColNext, it must point backward to col

        dropColNext.values ? dropColNext.entity.setData("prev_column_id", columnId) : 0

        await col.entity.patch("columns", {})
        await colNext.entity.patch("columns", {})
        await dropCol.entity.patch("columns", {})
        dropColNext.values ? dropColNext.entity.patch("columns", {}) : 0
        sendEvent(`columnDragged`, {})

    }


}

export { Columns }
