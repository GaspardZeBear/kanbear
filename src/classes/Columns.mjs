//import { ApiCaller } from "./ApiCaller.mjs"

import { Column } from "./Column.mjs"
import { Kontext } from "./Kontext.mjs"

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
        let columns = []
        Object.entries(Kontext.getJsonBulkData()[projectId].columns).forEach(([key, col]) => {
            columns.push(col)
        })
        this.sortedColumnsList = columns.sort(function (a, b) {
            return b.nextColumnId - a.nextColumnId;
        });
        //this.columns = await Column.getAll('columns', {projectId:projectId})
    }

    //------------------------------------------------------------------------
    getColumn(index) {
        //this.buildOrderedList()
        let column=null
        if ( this.sortedColumnsList.length > index ) {
            column=this.sortedColumnsList[index]
        }
        return(column)
    }

    //------------------------------------------------------------------------
    // Insert new col at the beginning. Old first must Point to the new col
    Xchain(columnId) {
        return
        this.buildOrderedList()
        if ( this.sortedColumnsList.length > 0 ) {
            this.sortedColumnsList[0]
        }
    }


}

export { Columns }
