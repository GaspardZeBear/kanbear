import { Kontext } from "./Kontext.mjs"
import { Ref } from "./Ref.mjs"

class Task {

    constructor(task) {
        this.task = task
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
    setSwimlane(oldSwimlaneId,newSwimlaneId) {
        let project=Kontext.getCurrentProject()
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
        taskElement.setAttribute("id", dragId)
        taskElement.classList.add('kanban-item');
        taskElement.setAttribute("draggable", true)
        taskElement.innerHTML = `
            <div class="kanban-item-header">
                <div class="kanban-item-title">#${this.task.id}</div>
                <div class="kanban-item-title">${this.task.title}</div>
                <div class="kanban-item-description">blabla description${this.task.description}</div>
                <button class="edit-task-btn" data-task-id="${this.task.id}">Edit</button>
            </div>
           `;
        //       <div class="kanban-item-description">${task.description}</div>

        //container.appendChild(taskElement);

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

        const editBtn = taskElement.querySelector('.edit-task-btn');
        editBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            thsi.task.openEditPopup();
        });
        return (taskElement)
    }

    //---------------------------------------------------------------------------------
    openEditPopup() {
        //alert(this.task.id);
        let popup = document.getElementById('taskPopup')
        console.log(popup)
        //popup.style.display('flex')
    }

    // Fermer la popup
    //closeBtn.addEventListener('click', function() {
    //    popup.style.display = 'none';
    //});


}
export { Task }