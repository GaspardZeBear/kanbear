import { KanboardFilter } from "./KanboardFilter.mjs"
import { Kontext } from "./Kontext.mjs"
import { TaskManager } from "./TaskManager.mjs"
import { ProjectManager } from "./ProjectManager.mjs"

class KanbanPanel {
  //------------------------------------------------------------------------
  constructor(element, filtersMap) {
    this.projects = Kontext.getJsonBulkData()
    console.log("KanbanPanel constructor pid", Kontext.getCurrentProjectId())
    this.project = Kontext.getJsonBulkData()[Kontext.getCurrentProjectId()] || undefined
    this.htmlElement = element
    this.kanboardFilter = new KanboardFilter(filtersMap)
    this.buttons = {}
    this.table = undefined
    this.kColumns = {}

  }

  //------------------------------------------------------------------------
  render() {
    console.log("render pid ", this.project)
    let [displayable, cause] = new ProjectManager(this.project).isDisplayable()
    if (!displayable) {
      document.getElementById(this.htmlElement).innerHTML = `Project not displayable ${cause}`
      return
    }
    document.getElementById(this.htmlElement).innerHTML = this.project.name
    this.buildKanbanDivsForProject(this.project)
    //this.buildkColumnsQuerySelectors(this.projects[0])
    this.setDropZones(this.project)
    this.loadTasksForProject(this.project)
  }

  //----------------------------------------------------------------------------------------
  buildKanbanDivsForProject(project) {
    console.log("buildKanbanDivsForProject", project)
    const kanbanDiv = document.createElement('div')
    kanbanDiv.classList.add("kanban-board")
    kanbanDiv.setAttribute("id", project.id)
    kanbanDiv.setAttribute("data-projectid", project.id)
    Object.entries(project.swimlanes).forEach(([sKey, swimlane]) => {
      if (!this.kanboardFilter.keepSwimlane(swimlane.name)) { return }
      // create kanban-swimlane
      const kSwimlaneDiv = document.createElement('div')
      kSwimlaneDiv.classList.add("kanban-swimlane")
      kSwimlaneDiv.setAttribute("data-swimlane-id", swimlane.id)
      // create swimlane-header
      const kSwimlaneHeaderDiv = document.createElement('div')
      kSwimlaneHeaderDiv.classList.add("swimlane-header")
      // create fill-in header
      const kSwimlaneDivH2 = document.createElement('h2')
      kSwimlaneDivH2.innerHTML = `${project.name}>${swimlane.name}`

      kSwimlaneHeaderDiv.appendChild(kSwimlaneDivH2)
      kSwimlaneDiv.appendChild(kSwimlaneHeaderDiv)

      // create columns for this swimlane
      const kSwimlaneColumnsDiv = document.createElement('div')
      kSwimlaneColumnsDiv.classList.add("swimlane-columns")

      Object.entries(project.columns).forEach(([tKey, col]) => {
        // create a kanban-column
        console.log("buildkColumnsDivsForProject(project) col=", col)
        const kColumnDiv = document.createElement('div')
        kColumnDiv.classList.add("kanban-column")
        //kColumnDiv.setAttribute("data-status", col.title)
        kColumnDiv.setAttribute("data-status", col.id)
        kColumnDiv.setAttribute("data-swimlane-id", swimlane.id)

        // create kanban-column-header
        const kColumnHeaderDiv = document.createElement('div')
        kColumnHeaderDiv.setAttribute("data-swimlane-id", swimlane.id)
        kColumnHeaderDiv.classList.add("kanban-column-header")

        // fillin column header
        const kColumnHeaderDivH3 = document.createElement('h3')
        kColumnHeaderDivH3.innerHTML = col.title
        const kCounterDiv = document.createElement('span')
        kCounterDiv.classList.add("kanban-count")
        kCounterDiv.setAttribute("id", `counter:${project.id}:${swimlane.id}:${col.id}`)
        kCounterDiv.innerHTML = 0

        // create kanban-items
        const kColumnItemsDiv = document.createElement('div')
        kColumnItemsDiv.classList.add("kanban-items")
        kColumnItemsDiv.setAttribute("data-status", col.id)
        kColumnItemsDiv.setAttribute("data-swimlane-id", swimlane.id)

        const addButtonDiv = document.createElement('button')
        addButtonDiv.classList.add("add-item-btn")
        addButtonDiv.setAttribute("data-swimlane-id", swimlane.id)
        addButtonDiv.setAttribute("data-status", col.id)
        addButtonDiv.innerHTML = "+"

        // link all
        kColumnHeaderDiv.appendChild(kColumnHeaderDivH3)
        kColumnHeaderDiv.appendChild(kCounterDiv)
        kColumnDiv.appendChild(kColumnHeaderDiv)
        kColumnDiv.appendChild(kColumnItemsDiv)
        kColumnHeaderDiv.appendChild(addButtonDiv)
        // kColumnDiv.appendChild(addButtonDiv)


        kSwimlaneColumnsDiv.appendChild(kColumnDiv)
        kSwimlaneDiv.appendChild(kSwimlaneColumnsDiv)

      })
      kanbanDiv.appendChild(kSwimlaneDiv)
      console.log(this.kColumns)
    })
    document.getElementById(this.htmlElement).appendChild(kanbanDiv)
  };

  //----------------------------------------------------------------------------------------
  setDropZones(project) {
    //console.log("setDropZones")
    this.kColumns[project.id] = {}
    const qs = `.kanban-items`
    //console.log("qs", qs)
    const zones = document.querySelectorAll(qs)
    console.log(zones)
    zones.forEach((zone) => {
       console.log("listener",zone)
      zone.addEventListener('dragover', (ev) => {
        console.log("dargover",zone)
        ev.preventDefault()
        zone.classList.add("drag-over")
      })
      zone.addEventListener('dragleave', (ev) => {
        zone.classList.remove("drag-over")
      })
      zone.addEventListener('drop', (ev) => {
        console.log(zone)
        ev.preventDefault()
        zone.classList.remove("drag-over")
        const data = ev.dataTransfer.getData("dragId");
        console.log("setDropZone() drop ev", ev)
        console.log("setDropZone() drop target", ev.target)
        console.log("parent",ev.target.closest(".kanban-items"))
        let itemsDiv=ev.target.closest(".kanban-items")
        //
        itemsDiv.appendChild(document.getElementById(data))
      })

    })
    document.querySelectorAll('.kanban-item-header button, .kanban-item-title, .kanban-item-description').forEach(el => {
      el.addEventListener('dragstart', function (e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      });
    });
  };

  //------------------------------------------------------------------------
  // Searh if task in swimlane/column
  // status is column !
  //------------------------------------------------------------------------
  loadTasksForProject(project) {
    const kSwimlanes = document.querySelectorAll('.kanban-swimlane');
    kSwimlanes.forEach(kSwimlane => {
      const kSwimlaneId = kSwimlane.dataset.swimlaneId;
      const kColumns = kSwimlane.querySelectorAll('.kanban-column');

      kColumns.forEach(kColumn => {
        const status = kColumn.dataset.status;
        const container = kColumn.querySelector('.kanban-items');
        container.innerHTML = '';

        if (project.swimlanes[kSwimlaneId]) {
          Object.entries(project.swimlanes[kSwimlaneId].tasks).forEach(([tKey, task]) => {
            if (task.column_id == status) {
              this.createTaskElement(task, status, kSwimlaneId, container);
            }
            //Mettre à jour le compteur
            this.updateCounter(status, kSwimlaneId);
          })
        }
      })

    });
  }

  //---------------------------------------------------------------------------------------
  updateCounter(status, swimlaneId) {
    const column = document.querySelector(`.kanban-column[data-status="${status}"][data-swimlane-id="${swimlaneId}"]`);
    const countElement = column.querySelector('.kanban-count');
    const count = column.querySelectorAll('.kanban-item').length;
    countElement.textContent = count;
  }

  //-----------------------------------------------------------------------------------------------------
  createTaskElement(task, status, swimlaneId, container) {
    const dragId = `drag-${task.id}`
    const taskElement = document.createElement('div');
    taskElement.setAttribute("id", dragId)
    taskElement.classList.add('kanban-item');
    taskElement.setAttribute("draggable", true)
    taskElement.innerHTML = `
            <div class="kanban-item-header">
                <div class="kanban-item-title">#${task.id}</div>
                <div class="kanban-item-title">${task.title}</div>
                <button class="edit-task-btn" data-task-id="${task.id}">Edit</button>
            </div>
           `;
    //       <div class="kanban-item-description">${task.description}</div>

    container.appendChild(taskElement);

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
      new TaskManager(task).openEditPopup();
    });
  }


}

export { KanbanPanel }