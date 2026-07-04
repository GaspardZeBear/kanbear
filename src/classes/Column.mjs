import { ApiCaller } from "./ApiCaller.mjs"
import { KanbearEntity } from "./KanbearEntity.mjs"
import { KanbearEntityFactory } from "./KanbearEntityFactory.mjs"
import { Columns } from './Columns.mjs'

class Column extends KanbearEntity {

    //------------------------------------------------------------------------
    constructor(column) {
        super('column',column)
        this.column = column
    }

    //-------------------------------------------------------------------------------------
    async postCreate(id) {
        console.log("Column.postCreate()","fired","id",id)
        // insert the new Column at first place
        let firstColumn=await new Columns().getColumn(0)
        if ( firstColumn) {
           // at least one column exists
           // replace first column with new one
           console.log("Column.postCreate()","cols already exist", firstColumn)

           console.log("Column.postCreate()","patch current column")
           let currentColEntity = await KanbearEntityFactory.generate('column')
           currentColEntity.setId(id)
           await currentColEntity.get('column', {})
           currentColEntity.setData("prev_column_id", 0)
           currentColEntity.setData("next_column_id", firstColumn.id)
           await currentColEntity.patch("column",{})
           // update ex-first colmun

           console.log("Column.postCreate()","patch previous 1st column")
           let colEntity = await KanbearEntityFactory.generate('column')
           colEntity.setId(firstColumn.id)
           await colEntity.get('column', {})
           colEntity.setData("prev_column_id",id)
           await colEntity.patch("column",{})
        } else {
           // no column exists !
           console.log("Column.postCreate()","first col !!")
           this.setData("next_column_id", 0) 
           this.setData("prev_column_id", 0)
           await this.patch("column",{})
        }
        /*
        let colEntity = await KanbearEntityFactory.generate('column')
          colEntity.setId(firstColumn.id)
          let col = await colEntity.get('column', {})
          colEntity.setData("prev_column_id", co.id)
          await colEntity.patch("columns", {})
          */
    }

    //-------------------------------------------------------------------------------------
    async postPatch(data) {
        console.log("Column.postPatch()","fired","id",this.id,"data",data)
    }

}

export { Column }
