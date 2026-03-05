import { KanboardFilter } from "./KanboardFilter.mjs"
import { Kontext } from "./Kontext.mjs"

class KanbanPanel {
  //------------------------------------------------------------------------
  constructor(element, filtersMap) {
    this.projects = Kontext.getJsonBulkData()
    this.htmlElement = element
    this.kanboardFilter = new KanboardFilter(filtersMap)
    this.buttons = {}
    this.table = undefined
    this.kColumns = {}

  }

  //------------------------------------------------------------------------
  render() {
    document.getElementById(this.htmlElement).innerHTML = "Kanban to come"
    this.buildKanbanDivsForProject(this.projects[0])
    //this.buildkColumnsQuerySelectors(this.projects[0])
    this.setDropZones(this.projects[0])
    this.loadTasksForProject(this.projects[0])
  }

  /*

<    <div class="kanban-board">
        <!-- Swimlane 1 -->
        <div class="kanban-swimlane" data-swimlane-id="1">
            <div class="swimlane-header">
                <h2>Urgent</h2>
            </div>
            <div class="swimlane-columns">
                <!-- Colonne "À faire" pour cette swimlane -->
                <div class="kanban-column" data-status="todo" data-swimlane-id="1">
                    <div class="kanban-column-header">
                        <h3>À faire</h3>
                        <span class="kanban-count">0</span>
                    </div>
                    <div class="kanban-items" data-status="todo" data-swimlane-id="1"></div>
                    <button class="add-item-btn" data-status="todo" data-swimlane-id="1">+ Ajouter</button>
                </div>

                <!-- Colonne "En cours" pour cette swimlane -->
                <div class="kanban-column" data-status="in-progress" data-swimlane-id="1">
                    <div class="kanban-column-header">
                        <h3>En cours</h3>
                        <span class="kanban-count">0</span>
                    </div>
                    <div class="kanban-items" data-status="in-progress" data-swimlane-id="1"></div>
                    <button class="add-item-btn" data-status="in-progress" data-swimlane-id="1">+ Ajouter</button>
                </div>
                */

  //----------------------------------------------------------------------------------------
  buildKanbanDivsForProject(project) {
    console.log("buildkColumnsForProject(project)", project)
    const kanbanDiv = document.createElement('div')
    kanbanDiv.classList.add("kanban-board")
    kanbanDiv.setAttribute("id", project.id)
    kanbanDiv.setAttribute("data-projectid", project.id)
    Object.entries(project.swimlanes).forEach(([sKey, swimlane]) => {

      // create kanban-swimlane
      const kSwimlaneDiv = document.createElement('div')
      kSwimlaneDiv.classList.add("kanban-swimlane")
      kSwimlaneDiv.setAttribute("data-swimlane-id", swimlane.id)
      // create swimlane-header
      const kSwimlaneHeaderDiv = document.createElement('div')
      kSwimlaneHeaderDiv.classList.add("swimlane-header")
      // create fill-in header
      const kSwimlaneDivH2 = document.createElement('h2')
      kSwimlaneDivH2.innerHTML = swimlane.name

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
        kCounterDiv.innerHTML = 0

        // create kanban-items
        const kColumnItemsDiv = document.createElement('div')
        kColumnItemsDiv.classList.add("kanban-items")
        //kColumnItemsDiv.setAttribute("id", `${col.title}-items`)
        // col.id or col.title ????
        kColumnItemsDiv.setAttribute("data-status", col.id)
        kColumnItemsDiv.setAttribute("data-swimlane-id", swimlane.id)
        //kColumnItemsDiv.setAttribute("ondragover", "handleDragover(event)")
        //kColumnItemsDiv.setAttribute("ondrop", "handleDrop(event)")

        const addButtonDiv = document.createElement('button')
        addButtonDiv.classList.add("add-item-btn")
        addButtonDiv.setAttribute("data-swimlane-id", swimlane.id)
        //addButtonDiv.setAttribute("data-status", col.title)
        addButtonDiv.setAttribute("data-status", col.id)
        addButtonDiv.innerHTML = "Add"

        // link all
        kColumnHeaderDiv.appendChild(kColumnHeaderDivH3)
        kColumnDiv.appendChild(kColumnHeaderDiv)
        kColumnDiv.appendChild(kColumnItemsDiv)
        kColumnDiv.appendChild(addButtonDiv)

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
    console.log("setDropZones")
    this.kColumns[project.id] = {}
    const qs = `.kanban-items`
    console.log("qs", qs)
    const zones = document.querySelectorAll(qs)
    console.log(zones)
    zones.forEach((zone) => {
      zone.addEventListener('dragover', (ev) => {
        console.log("dragover")
        ev.preventDefault()
      })
      zone.addEventListener('drop', (ev) => {
        console.log("drop-inner")
        console.log(ev)
        ev.preventDefault()
        const data = ev.dataTransfer.getData("dragId");
        console.log(data)
        //const x=document.createElement('div')
        //x.innerHTML=data
        
        console.log(ev.target)
        ev.target.appendChild(document.getElementById(data))
      })

    })
  };
  //----------------------------------------------------------------------------------------
  xbuildkColumnsQuerySelectors(project) {
    console.log("buildkColumnsQuerySelectors(project)", project)
    this.kColumns[project.id] = {}
    Object.entries(project.swimlanes).forEach(([sKey, swimlane]) => {
      Object.entries(project.columns).forEach(([key, col]) => {
        console.log("buildkColumnsQuerySelectors(project) col=", col)
        const qs = `[data-status="${col.title}"].kanban-items`
        console.log("qs", qs)
        const querySelector = document.querySelector(qs)
        console.log("document.querySelector ", querySelector)
        const title = `${col.title}`
        this.kColumns[project.id][title] = querySelector
      })
    })
    console.log(this.kColumns)
  };

  //------------------------------------------------------------------------
  loadTasksForProject(project) {
    const kSwimlanes = document.querySelectorAll('.kanban-swimlane');
    console.log("load() kSwimlanes", kSwimlanes)
    kSwimlanes.forEach(kSwimlane => {
      console.log("load() kSwimlane ", kSwimlane)
      const kSwimlaneId = kSwimlane.dataset.swimlaneId;
      console.log("load() kSwimlaneId ", kSwimlaneId)
      const kColumns = kSwimlane.querySelectorAll('.kanban-column');

      kColumns.forEach(kColumn => {
        //console.log("load() kColumn ", kColumn)
        const status = kColumn.dataset.status;
        console.log("load() status ", status)
        const container = kColumn.querySelector('.kanban-items');
        container.innerHTML = '';

        if (project.swimlanes[kSwimlaneId]) {
          Object.entries(project.swimlanes[kSwimlaneId].tasks).forEach(([tKey, task]) => {
            //console.log("task ", task, "status", status)
            if (task.column_id == status) {
              this.createTaskElement(task, status, kSwimlaneId, container);
            }
            //Mettre à jour le compteur
            //this.updateCounter(status, kSwimlaneId);
          })
        }
      })

    });
  }

  // Mettre à jour le compteur de tâches
  updateCounter(status, swimlaneId) {
    const column = document.querySelector(`.kanban-column[data-status="${status}"][data-swimlane-id="${swimlaneId}"]`);
    const countElement = column.querySelector('.kanban-count');
    const count = column.querySelectorAll('.kanban-item').length;
    countElement.textContent = count;
  }

  //-----------------------------------------------------------------------------------------------------
  createTaskElement(task, status, swimlaneId, container) {
    const dragId=`drag-${task.id}`
    const taskElement = document.createElement('div');
    taskElement.setAttribute("id",dragId)
    taskElement.classList.add('kanban-item');
    //taskElement.draggable = true;
    taskElement.setAttribute("draggable",true)
    //taskElement.dataset.taskId = task.id;
    //taskElement.dataset.status = status;
    //taskElement.dataset.swimlaneId = swimlaneId;
    
    taskElement.innerHTML = `
            <div class="kanban-item-header">
                <div class="kanban-item-title">#${task.id}</div>
                <div class="kanban-item-title">${task.title}</div>
                <button class="edit-task-btn" data-task-id="${task.id}">Edit</button>
            </div>
            <div class="kanban-item-description">${task.description}</div>
          `;

    container.appendChild(taskElement);

    // Ajouter les événements de drag and drop
    //taskElement.addEventListener('dragstart', handleDragStart);

    taskElement.addEventListener('dragstart', (ev) => {
      console.log("dragstart")
      //taskElement.classList.add('dragging');
      //ev.dataTransfer.setData('text/taskId', task.id);
      //ev.dataTransfer.setData('text/status', status);
      //ev.dataTransfer.setData('text/swimlaneId', swimlaneId);
      ev.dataTransfer.setData('dragId', dragId);
      console.log(ev.dataTransfer)
      ev.dataTransfer.effectAllowed = 'move';
    })
    //taskElement.addEventListener('dragover', handleDragOver);
    //taskElement.addEventListener('dragend', handleDragEnd);

    // Ajouter l'événement pour éditer la tâche
    const editBtn = taskElement.querySelector('.edit-task-btn');
    editBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      openEditPopup(task.id, task.title, task.description, status, swimlaneId);
    });
  }

  // Mettre à jour le compteur de tâches
  updateCounter(status) {
    const column = document.querySelector(`.kanban-column[data-status="${status}"]`);
    const countElement = column.querySelector('.kanban-count');
    const count = column.querySelectorAll('.kanban-item').length;
    countElement.textContent = count;
  }
}

//----- function out of object cause this is ambiguous 

let draggedItem = null;
let currentTaskId = null;

// Gestion du drag and drop
function XhandleDragStart(ev) {
  console.log("dragstart")
  draggedItem = this;
  //this.classList.add('dragging');
  ev.dataTransfer.setData('text/taskId', this.dataset.taskId);
  ev.dataTransfer.setData('text/status', this.dataset.status);
  ev.dataTransfer.setData('text/swimlaneId', this.dataset.swimlaneId);
  console.log(ev.dataTransfer.getData("text"))
  ev.dataTransfer.effectAllowed = 'move';
}


function xhandleDragover(ev) {
  console.log("dragover")
  ev.preventDefault()
}


function XhandleDrop(ev) {
  console.log("drop")
  console.log(ev)
  ev.preventDefault()
  const data = ev.dataTransfer.getData("text/html");
  console.log(data)
  //const x=document.createElement('div')
  //x.innerHTML=data
  //document.getElementById(data))
  ev.target.appendChild(data)
}

export { KanbanPanel }