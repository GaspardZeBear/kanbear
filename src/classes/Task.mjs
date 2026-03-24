import { KanbearEntity } from "./KanbearEntity.mjs"
import { Kontext } from "./Kontext.mjs"
import { Ref } from "./Ref.mjs"

class Task extends KanbearEntity {

    //------------------------------------------------------------------------
    constructor(task) {
        super('task',task)
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
    createKanbanTaskElement() {
        //const dragId = `drag-${task.id}`
        const dragId = Ref.getRefFromTask('drag', this.task)
        const taskElement = document.createElement('div');
        this.elementId=dragId
        taskElement.setAttribute("id", dragId)
        taskElement.classList.add('kanban-item');
        taskElement.setAttribute("draggable", true)

        //const dummyDiv = document.createElement("div")
        const headerDiv = document.createElement("div")
        headerDiv.classList.add("kanban-item-header")

        const top = document.createElement("div")
        top.classList.add("kanban-item-name")
        top.innerHTML = `#${this.task.id} ${this.task.name}`

        const description = this.task.description ?? "noDesc"
        const tDesc = document.createElement("div")
        tDesc.classList.add("kanban-item-name")
        tDesc.innerHTML = description

        //let editBtnDiv=document.createElement("div")
        let editBtn = document.createElement("button")
        editBtn.classList.add("edit-task-btn")
        editBtn.setAttribute("id", `taskEditButton-${this.task.id}`)
        editBtn.setAttribute("data-task-id", `${this.task.id}`)
        editBtn.innerHTML = "Edit"

        headerDiv.appendChild(top)
        headerDiv.appendChild(tDesc)


        // Strange behaviour : edit button clickable or not  !!!!!!!!!!!!!!!!!!!!!!!!!
        // append editBtn to headerDiv Does not work : click listener not activatide 
        //headerDiv.append(editBtn)
        taskElement.appendChild(headerDiv)
        // append editBtn append to taskElement works
        taskElement.appendChild(editBtn)

        taskElement.addEventListener('dragstart', (ev) => {
            console.log("dragstart")
            ev.dataTransfer.setData('dragId', dragId);
            console.log(ev.dataTransfer)
            ev.target.classList.add("dragging")
            //ev.stopPropagation()
            ev.dataTransfer.effectAllowed = 'move';
        })

        taskElement.addEventListener('dragend', (ev) => {
            console.log("dragend")
            //ev.dataTransfer.setData('dragId', dragId);
            //console.log(ev.dataTransfer)
            ev.target.classList.remove("dragging")
        })

        editBtn = taskElement.querySelector('.edit-task-btn');
        //console.log(editBtn)
        let task=this
        editBtn.addEventListener('click', function (ev) {
            console.log("Edit task")
            ev.stopPropagation();
            task.openEditPopup();
        });
        console.log(editBtn)
        return (taskElement)
    }

    //---------------------------------------------------------------------------------
    async openEditPopupAsync() {
        let popup = document.getElementById('taskPopup')
        let description=prompt("description : ")
        this.setDescription(description)
        this.task.description=description
        await this.patch()
        document.getElementById(this.elementId).replaceWith(this.createKanbanTaskElement())
    }

    //---------------------------------------------------------------------------------------------
    openEditPopup() {
        this.openEditPopupAsync()
    }

    // Fermer la popup
    //closeBtn.addEventListener('click', function() {
    //    popup.style.display = 'none';
    //});


}
export { Task }