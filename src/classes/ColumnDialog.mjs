import { Dialog } from './Dialog.mjs'
import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'
import { sendEvent } from '../utils/sendEvent.mjs'
import { Column } from './Column.mjs'

class ColumnDialog extends Dialog {

    constructor(dialogName) {
        super('column')
        this.dialogName = dialogName
        this.column=null
    }

     //----------------------------------------------------------------------------
    Xcreate(projectId) {
        this.projectId = projectId
        this.createDialog(this.save.bind(this))
        this.showDialog("Create column")
    }

    //-------------------------------------------------------------------------------------
    async Xsave() {
        console.log("save() dialog, field name", columnForm.columnName.value)
        const co = await KanbearEntityFactory.generate('column')
        co.setData("project_id", this.projectId)
        co.setName(columnForm.columnName.value)
        co.setDescription(columnForm.columnDescription.value)
        await co.create()
        this.closeDialog()
        sendEvent("columnCreated",{ columnId: co.getId() })
        this.column=co
    }

        //----------------------------------------------------------------------------
    async fillFormFromDb(column) {
        console.log("columnDialog.fillFormFromDb() column>", column)
        //let projectColor = await buildColorSelectBox(project.color, 'projectColor', 'Project Color')
        //document.getElementById("projectColorDiv").replaceChildren(projectColor)
        columnForm.columnName.value = column.name
        columnForm.columnDescription.value = column.description
        //columnForm.columnPosition.value = column.position
        //columnForm.columnIsOpen.value = column.is_open
        //console.log("ColumnDialog() fillFormIsOpen ", column.is_open)
        //if (column.is_open > 0) {
        //    document.getElementById("columnIsOpen").setAttribute("checked", "")
        //}
    }

    //----------------------------------------------------------------------------
    async fillDbFromForm(column) {
        column.setData("name", columnForm.columnName.value)
        column.setData("description", columnForm.columnDescription.value)
        //let color = projectForm.projectColor.value < 0 ? "white" : projectForm.projectColor.value
        //project.setData("color", color)
        column.setName(columnForm.columnName.value)
        column.setDescription(columnForm.columnDescription.value)
        //if (columnForm.columnIsOpen.checked) {
        //    column.setData("is_open", 1)
        //} else {
        //    column.setData("is_open", 0)
        //}
        //console.log("ColumnDialog() fillDb IsOpen ", columnForm.columnIsOpen.checked)
    }


    //----------------------------------------------------------------------------
    create(projectId) {
        console.log("Column.create() dialog, for  <projectId>",projectId)
        this.projectId = projectId
        this.createDialog(this.save.bind(this))
        this.showDialog("Create column")
    }

    //-------------------------------------------------------------------------------------
    async save() {
        console.log("Column.save() dialog, <name>", columnForm.columnName.value)
        const co = await KanbearEntityFactory.generate('column')
        co.setData("project_id", this.projectId)
        this.fillDbFromForm(co)
        try {
            let resp = await co.create()
            this.closeDialog()
            sendEvent("columnCreated", { columnId: co.getId() })
        } catch (error) {
            this.setMessage(error.cause?.msg)
            this.create(this.columnId)
        }
    }

    //----------------------------------------------------------------------------
    async modify(columnId) {
        this.columnId = columnId
        this.column = new Column({ id: columnId })
        try {
            const co = await this.column.get()
            console.log("ColumnDialog.modify() <co>", co)
            await this.fillFormFromDb(co)
            this.createDialog(this.saveModify.bind(this))
            this.showDialog("Modify column")
        } catch (error) {
            console.log(error)
            this.setMessage(error.cause?.msg)
            this.modify(this.columnId)
        }
    }

    //-------------------------------------------------------------------------------------
    async saveModify() {
        console.log("ColumnDialog.saveModify()")
        this.fillDbFromForm(this.column)
        try {
            let resp = await this.column.patch({})
            this.closeDialog()
            sendEvent("columnModified", { column: this.column.getId() })
        } catch (error) {
            console.log(error)
            this.setMessage(error.cause?.msg)
            this.modify(this.column.id)
        }
    }


}



export { ColumnDialog }
