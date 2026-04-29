import { Dialog } from './Dialog.mjs'
import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'
import { sendEvent } from '../utils/sendEvent.mjs'
import { Column } from './Column.mjs'
import { selectBoxBuilder, colorBoxBuilder, buildColorSelectBox } from '../utils/selectBoxBuilder.mjs'


class ColumnDialog extends Dialog {

    constructor(dialogName) {
        super('column')
        this.dialogName = dialogName
        this.column=null
    }

    //----------------------------------------------------------------------------
    async fillFormFromDb(column) {
        console.log("columnDialog.fillFormFromDb() <column>", column)
        columnForm.columnName.value = column.name
        columnForm.columnDescription.value = column.description
        let columnColor = await buildColorSelectBox(column.color, 'columnColor', 'Column Color')
        console.log("columnDialog.fillFormFromDb() <columnColor>", columnColor)
        document.getElementById("columnColorDiv").replaceChildren(columnColor)
    }

    //----------------------------------------------------------------------------
    async fillDbFromForm(column) {
        column.setData("name", columnForm.columnName.value)
        column.setData("description", columnForm.columnDescription.value)
        column.setName(columnForm.columnName.value)
        let color = columnForm.columnColor.value < 0 ? "white" : columnForm.columnColor.value
        column.setData("color", color)
        column.setDescription(columnForm.columnDescription.value)
    }

    //----------------------------------------------------------------------------
    async subCreate(params) {
        console.log("ColumnDialog.create() dialog, for  <projectId>",params)
        this.projectId = params["projectId"]
        let columnColor = await buildColorSelectBox('', 'columnColor', 'Column Color')
        document.getElementById("columnColorDiv").replaceChildren(columnColor)
    }

    //-------------------------------------------------------------------------------------
    async subSave(co) {
        console.log("ColumDialog.subSave() <name>", columnForm.columnName.value)
        //const pr = await KanbearEntityFactory.generate('project')
        co.setData("project_id", this.projectId)
        this.fillDbFromForm(co)
    }

    //----------------------------------------------------------------------------
    async subModify(params) {
        console.log("ColumnDialog.subModify() <params>", params)
        return( params["columnId"])
    }
}

export { ColumnDialog }
