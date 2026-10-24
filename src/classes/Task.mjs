import { KanbearEntity } from "./KanbearEntity.mjs"
import { TaskDialog } from "./TaskDialog.mjs"
import { Kontext } from "./Kontext.mjs"
import { Ref } from "./Ref.mjs"
import { buildAddDummyButton, buildAddNoteButton, buildAddOpenCloseButton, buildTasksCommentsButton, buildDeleteTaskButton, buildOpenCloseButton } from "../utils/buttonBuilder.mjs"
import { buildTasksCommentsLink } from "../utils/linkBuilder.mjs"
import { getOpenCloseSymbol, getOpenCloseClass } from "../utils/openClose.mjs"
import { mustDisable, REFERENCE, READ, WRITE, DELETE, ISADMIN } from "../utils/rights.mjs"
import { sendEvent } from "../utils/sendEvent.mjs"
import { createElement } from "../utils/createHtml.mjs"

class Task extends KanbearEntity {

    //------------------------------------------------------------------------
    constructor(task) {
        super('task', task)
        this.task = task
        //this.id=task.id
        this.ref = null
        //this.openPopup()
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
        //console.log("Task.getTaskDisplayColor()", "task", this.task, "color")
        //console.log("Task.getTaskDisplayColor()", "taskColorLen", this.task.color.length)
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
    createKanbanTaskElement() {
        //const dragId = `drag-${task.id}`
        const dragId = Ref.getRefFromTask('drag', this.task)
        const taskElement = document.createElement('div');
        this.elementId = dragId
        taskElement.setAttribute("id", dragId)
        taskElement.classList.add('kanban-item');
        if (!mustDisable(WRITE)) {
            taskElement.setAttribute("draggable", true)
        }
        let style = `background-color:${this.getTaskDisplayColor()}`
        taskElement.setAttribute("style", style)
        const headerDiv = document.createElement("div")
        headerDiv.classList.add("kanban-item-header")
        let myTask = this.task
        let myTaskEntity = this
        let editTaskFn = function (ev) {
            console.log("editTaskFn event Listener fired <myTask>", myTaskEntity)
            ev.stopPropagation();
            const task = new TaskDialog()
            task.modify({ taskId: myTaskEntity.id });
        }

        let ocDisabled = mustDisable(WRITE)
        const href = createElement('div', {
            children: [
                createElement("a", {
                    id: `taskHref_${this.task.id}`,
                    href: "javascript:void(0)",
                    innerHTML: `Task #${this.task.id}`,
                    onclick: [editTaskFn, { once: true }]
                }),
                buildOpenCloseButton(this, ocDisabled, (doIt) => {
                    if (doIt) {
                        myTaskEntity.patch({ is_open: myTaskEntity.getOpen() }).catch(() => { })
                    }
                    sendEvent("taskModified", {})
                }
                ),
                //createElement("span",{textContent:`${getOpenCloseSymbol(this.task.is_open)}`}),
                createElement('br'),
                createElement('b', {
                    children: [createElement("span", { textContent: this.task.name })]
                })
            ]
        })

        const description = this.task.description ?? "noDescription"
        const tDescription = document.createElement("div")
        tDescription.classList.add("kanban-item-name")
        tDescription.innerHTML = `${description}`

        const note = this.task.note ?? "noNote"
        const tNote = document.createElement("div")
        tNote.setAttribute("style", "border:1px solid #ccc")
        tNote.appendChild(buildAddNoteButton(this.task.id, this))

        const noteText = document.createElement("span")
        noteText.classList.add("kanban-item-name")
        let noteStyle = `background-color:pink;font-style:italic`
        noteText.setAttribute("style", noteStyle)
        noteText.innerHTML = `${note}`
        tNote.appendChild(noteText)

        //headerDiv.appendChild(top)
        const assignee = Kontext.getCurrentProject().assignees[this.task.assignee_id]?.name || "noAssignee"
        const tAssignee = document.createElement("div")
        tAssignee.classList.add("kanban-item-name")
        tAssignee.innerHTML = `${assignee}`


        headerDiv.appendChild(tDescription)
        //headerDiv.appendChild(tNote)
        headerDiv.appendChild(tAssignee)


        // !!!!!!!!!!!!!!!!!!! Append link to headerDiv does not work !!!! 
        // Must append it to taskElement
        // //////:headerDiv.appendChild(href)
        //taskElement.appendChild(href)

        // let's try 
        const topLineDiv = document.createElement("div")
        topLineDiv.classList.add("kanban-item-topline")

        const hrefDiv = document.createElement("div")

        hrefDiv.appendChild(href)
        topLineDiv.appendChild(hrefDiv)

        const commentDiv = document.createElement("div")
        //commentDiv.appendChild(buildTasksCommentsLink(this.task.id,'Co'))
        commentDiv.appendChild(buildTasksCommentsButton(this.task.id, 'Co'))
        topLineDiv.appendChild(commentDiv)

        const deleteDiv = document.createElement("div")
        let disabled = mustDisable(DELETE)
        deleteDiv.appendChild(buildDeleteTaskButton(this.task.id, this, disabled, (doIt) => {
            if (doIt) {
                this.delete().catch(() => console.log("Task deleted reject"))
            }
            sendEvent("taskDeleted", {})
        }))

        topLineDiv.appendChild(deleteDiv)


        const dummyDiv = document.createElement("div")
        dummyDiv.innerHTML = "Open/close,Del,Comment"
        //topLineDiv.appendChild(dummyDiv)

        taskElement.appendChild(topLineDiv)

        taskElement.appendChild(headerDiv)
        taskElement.appendChild(tNote)

        taskElement.addEventListener('dragstart', (ev) => {
            //console.log("dragstart")
            ev.dataTransfer.setData('dragId', dragId);
            //console.log(ev.dataTransfer)
            ev.target.classList.add("dragging")
            //ev.stopPropagation()
            ev.dataTransfer.effectAllowed = 'move';
        })

        taskElement.addEventListener('dragend', (ev) => {
            ev.target.classList.remove("dragging")
        })
        return (taskElement)
    }

}
export { Task }