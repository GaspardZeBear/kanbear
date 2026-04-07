import { KanbearEntity } from "./KanbearEntity.mjs"
import { TaskDialog } from "./TaskDialog.mjs"
import { Kontext } from "./Kontext.mjs"
import { Ref } from "./Ref.mjs"

class Task extends KanbearEntity {

    static db2Form={
      'id':'',
      'name':'taskName',
      'description':'taskDescription',
      'note':'taskNote',
      'color':'taskColor',
      'color_rules':'taskColorRules',
      'column_id':'',
      'user_id':'',
      'assignee_id':'taskAssignee',
      'position':'',
      'is_open':'taskIsOpen',
      'priority':'taskPriority',
      'swimlane_id':'',
      'date_created':'',
      'date_started':'taskDateStarted',
      'date_moved':'',
      'date_closed':'',
      'date_due':'taskDateDue',
      'date_checked':'',
      'date_modified':'',
      'moved_warning':'taskMovedWarning',
      'due_warning':'taskDueWarning',
      'checked_warning ':'taskCheckedWarning'
    }

    static form2Db = {}

    static {
        Object.entries(Task.db2Form).forEach( ([col,form]) => {
            if (form.length > 0) {
                Task.form2Db[form]=col
            }
        })
    }

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
        let style=`background-color:${this.task.color}`
        taskElement.setAttribute("style", style)
        //taskElement.style.setAttribute("background-color",this.task.color)
        //taskElement.style.setAttribute("style","italic")

        //const dummyDiv = document.createElement("div")
        const headerDiv = document.createElement("div")
        headerDiv.classList.add("kanban-item-header")

        const href = document.createElement("a")
        href.setAttribute("id",`taskHref_${this.task.id}`)
        href.setAttribute("href","javascript:void(0)")
        href.innerHTML=`${this.task.name}`
        let myTask=this.task
        let editTaskFn = function (ev) {
          console.log("editTaskHref event Listener fired <swimlane>",myTask.swimlane_id,"<column>",myTask.column_id)
          ev.stopPropagation();
          const task = new TaskDialog()
          task.modify(myTask.id);
        }
        href.addEventListener('click', editTaskFn, { once: true });
 
        /*
        const top = document.createElement("div")
        top.classList.add("kanban-item-name")
        top.innerHTML = `#${this.task.id} ${this.task.name}`
*/
        const description = this.task.description ?? "noDescription"
        const tDescription = document.createElement("div")
        tDescription.classList.add("kanban-item-name")
        tDescription.innerHTML = `${description}`

        const note = this.task.note ?? "noNote"
        const tNote = document.createElement("div")
        tNote.classList.add("kanban-item-name")
        let noteStyle=`font-style:italic`
        tNote.setAttribute("style", noteStyle)
        tNote.innerHTML = `Note : ${note}`

        /*
        //let editBtnDiv=document.createElement("div")
        let editBtn = document.createElement("button")
        editBtn.classList.add("edit-task-btn")
        editBtn.setAttribute("id", `taskEditButton-${this.task.id}`)
        editBtn.setAttribute("data-task-id", `${this.task.id}`)
        editBtn.innerHTML = "Edit"
        */

        //headerDiv.appendChild(top)
        
        headerDiv.appendChild(tDescription)
        headerDiv.appendChild(tNote)


        // Strange behaviour : edit button clickable or not  !!!!!!!!!!!!!!!!!!!!!!!!!
        // append editBtn to headerDiv Does not work : click listener not activatide 
        //headerDiv.append(editBtn)
        taskElement.appendChild(href)
        taskElement.appendChild(headerDiv)
        taskElement.appendChild(tNote)
        // append editBtn append to taskElement works
   
        //taskElement.appendChild(editBtn)

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
        return (taskElement)
    }

    //---------------------------------------------------------------------------------
    async openEditModalAsync() {
        let popup = document.getElementById('taskPopup')
        let description=prompt("description : ")
        this.setDescription(description)
        this.task.description=description
        await this.patch()
        document.getElementById(this.elementId).replaceWith(this.createKanbanTaskElement())
        const taskModifiedEvent = new CustomEvent("taskModified", {
                detail: {taskId:this.task.id},
                bubbles: true,
                cancelable: true,
                composed: true
              })
        document.dispatchEvent(taskModifiedEvent)
    }

    //---------------------------------------------------------------------------------------------
    openEditModal() {
        this.openEditModalAsync()
    }

}
export { Task }