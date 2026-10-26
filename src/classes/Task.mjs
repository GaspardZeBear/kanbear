import { KanbearEntity } from "./KanbearEntity.mjs"
import { TaskDialog } from "./TaskDialog.mjs"
import { Kontext } from "./Kontext.mjs"
import { Ref } from "./Ref.mjs"
import { buildAddDummyButton, buildAddNoteButton, buildAddOpenCloseButton, buildTasksCommentsButton, buildDeleteTaskButton, buildOpenCloseButton } from "../utils/buttonBuilder.mjs"
import { buildTasksCommentsLink } from "../utils/linkBuilder.mjs"
import { getOpenCloseSymbol, getOpenCloseClass } from "../utils/openClose.mjs"
import { mustDisable, REFERENCE, READ, WRITE, DELETE, ISADMIN } from "../utils/rights.mjs"
import { sendEvent } from "../utils/sendEvent.mjs"
import { createElement, getIdentityDiv, getDeleteEntityDiv } from "../utils/createHtml.mjs"

class Task extends KanbearEntity {

    //------------------------------------------------------------------------
    constructor(task) {
        super('task', task)
        this.task = task
        this.ref = null
    }

    //-------------------------------------------------------------------------
    setRef(ref) {
        this.ref = ref
    }

    //-------------------------------------------------------------------------
    getRef(ref) {
        return (this.ref)
    }

    //-------------------------------------------------------------------------
    setColumn(columnId) {
        this.task.column_id = columnId
    }

    //-------------------------------------------------------------------------
    // Move swimlane_id in task and 
    // - add task to new swimlane
    // - remove it from old swimlane
    // Beware : remove works by ref, so duplicate
    setSwimlane(oldSwimlaneId, newSwimlaneId) {
        let project = Kontext.getCurrentProject()
        if (oldSwimlaneId != newSwimlaneId) {
            this.task.swimlane_id = newSwimlaneId

            project.swimlanes[newSwimlaneId].tasks[this.task.id] = {}
            Object.assign(
                project.swimlanes[newSwimlaneId].tasks[this.task.id],
                project.swimlanes[oldSwimlaneId].tasks[this.task.id]
            )
            delete (project.swimlanes[oldSwimlaneId].tasks[this.task.id])
        }
    }

    //-----------------------------------------------------------------------------------------------------
    getTaskDisplayColor(col = undefined) {
        if (this.task.color && this.task.color.length > 0) {
            return (this.task.color)
        }
        if (!col) {
            col = Kontext.getCurrentProject().columns[this.task.column_id]
        }
        //console.log("Task.getTaskDisplayColor()", "col", col)
        return (col.color)
    }

    //-----------------------------------------------------------------------------------------------------
    getHeaderDiv() {
        return (createElement("div", {
            classes: ["kanban-item-header"],
            children: [
                name,
                createElement("div", {
                    classes: ["kanban-item-description"],
                    textContent: this.task.description ?? "noDescription"
                }),
                createElement("div", {
                    classes: ["kanban-assignee-name"],
                    textContent: Kontext.getCurrentProject().assignees[this.task.assignee_id]?.name || "noAssignee"
                })
            ]
        }))

    }

    //---------------------------------------------------------------------------------------------------
    getDeleteDiv() {
        const deleteDiv = document.createElement("div")
        return (deleteDiv.appendChild(buildDeleteTaskButton(this.task.id, this, mustDisable(DELETE), (doIt) => {
            if (doIt) {
                this.delete().catch(() => console.log("Task deleted reject"))
            }
            sendEvent("taskDeleted", {})
        }))
        )
    }

    //---------------------------------------------------------------------
    getTopLineDiv() {
        return (createElement("div", {
            classes: ["kanban-item-topline"],
            children: [
                createElement("div", { children: [getIdentityDiv(this, new TaskDialog())] }),
                createElement("div", { children: [buildTasksCommentsButton(this.task.id, 'Co')] }),
                //getDeleteEntityDiv(this,buildDeleteTaskButton(this.task.id, this, mustDisable(DELETE)))
                this.getDeleteDiv()
            ]
        }))
    }

    //------------------------------------------------------------------------------------------
    getNoteDiv() {
        return (createElement("div", {
            style: "border:1px solid #ccc",
            children: [
                buildAddNoteButton(this.task.id, this),
                createElement("span", {
                    classes: ["kanban-item-name"],
                    //style: `background-color:pink;font-style:italic`,
                    textContent: this.task.note ?? "noNote"
                })
            ]
        })
        )
    }

    //-----------------------------------------------------------------------------------------------------
    createKanbanTaskElement() {
        //const dragId = `drag-${task.id}`
        const dragId = Ref.getRefFromTask('drag', this.task)
    
        
        // !!!!!!!!!!!!!!!!!!! Append link to headerDiv does not work !!!! 
        // Must append it to taskElement
        const taskElement = createElement("div", {
            id: dragId,
            classes: ['kanban-item'],
            style: `background-color:${this.getTaskDisplayColor()}`,
            draggable: !mustDisable(WRITE),
            children: [
                this.getTopLineDiv(),
                this.getHeaderDiv(),
                this.getNoteDiv()
            ]
        })

        taskElement.addEventListener('dragstart', (ev) => {
            ev.dataTransfer.setData('dragId', dragId);
            ev.target.classList.add("dragging")
            ev.dataTransfer.effectAllowed = 'move';
        })

        taskElement.addEventListener('dragend', (ev) => {
            ev.target.classList.remove("dragging")
        })
        return (taskElement)
    }

}
export { Task }