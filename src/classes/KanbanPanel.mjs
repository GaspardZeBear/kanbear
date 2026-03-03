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
    this.buildkColumnsQuerySelectors(this.projects[0])
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
    kanbanDiv.setAttribute("id", project.id)
    Object.entries(project.swimlanes).forEach(([sKey, swimlane]) => {
      const kSwimlaneDiv = document.createElement('div')
      kSwimlaneDiv.classList.add("kanban-swimlane")
      kSwimlaneDiv.setAttribute("data-swimlane-id", swimlane.id)
      const kSwimlaneDivH2 = document.createElement('h2')
      kSwimlaneDivH2.innerHTML = swimlane.name
      kSwimlaneDiv.appendChild(kSwimlaneDivH2)

      Object.entries(project.columns).forEach(([tKey, col]) => {
        console.log("buildkColumnsDivsForProject(project) col=", col)
        const kColumnDiv = document.createElement('div')
        kColumnDiv.classList.add("kanban-column")
        //kColumnDiv.setAttribute("data-status", col.title)
        kColumnDiv.setAttribute("data-status", col.id)
        kColumnDiv.setAttribute("data-swimlane-id", swimlane.id)

        const kColumnHeaderDiv = document.createElement('div')
        kColumnHeaderDiv.setAttribute("data-swimlane-id", swimlane.id)
        kColumnHeaderDiv.classList.add("kanban-column-header")

        const kColumnHeaderDivH3 = document.createElement('h3')
        kColumnHeaderDivH3.innerHTML = col.title

        const kColumnItemsDiv = document.createElement('div')
        kColumnItemsDiv.classList.add("kanban-items")
        kColumnItemsDiv.setAttribute("id", `${col.title}-items`)
        kColumnItemsDiv.setAttribute("data-swimlane-id", swimlane.id)

        const addButtonDiv = document.createElement('button')
        addButtonDiv.classList.add("add-item-btn")
        addButtonDiv.setAttribute("data-swimlane-id", swimlane.id)
        addButtonDiv.setAttribute("data-status", col.title)
        addButtonDiv.innerHTML = "Add"

        kColumnHeaderDiv.appendChild(kColumnHeaderDivH3)
        kColumnDiv.appendChild(kColumnHeaderDiv)
        kColumnDiv.appendChild(kColumnItemsDiv)
        kColumnDiv.appendChild(addButtonDiv)

        kSwimlaneDiv.appendChild(kColumnDiv)

      })
      kanbanDiv.appendChild(kSwimlaneDiv)

      console.log(this.kColumns)
    })
    document.getElementById(this.htmlElement).appendChild(kanbanDiv)
  };

  //----------------------------------------------------------------------------------------
  buildkColumnsQuerySelectors(project) {
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


  //----------------------------------------------------------------------------------------------
  xloadTasksForProject(project) {
    Object.entries(project.swimlanes).forEach(([sKey, swimlane]) => {
      Object.entries(swimlane.tasks).forEach(([tKey, task]) => {
        //console.log(project)
        //console.log(task)
        const column = project.columns[task.column_id].title
        const container = this.kColumns[project.id][column]
        container.innerHTML = '';
        this.createTaskElement(task, column, container);
        //this.updateCounter(column);
      })
    })
  }

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
        console.log("load() kColumn ", kColumn)
        const status = kColumn.dataset.status;
        console.log("load() status ", status)
        const container = kColumn.querySelector('.kanban-items');
        container.innerHTML = '';

        Object.entries(project.swimlanes).forEach(([sKey, swimlane]) => {
          Object.entries(swimlane.tasks).forEach(([tKey, task]) => {
            console.log("task ", task)
            if (task.column_id === status ) {
              createTaskElement(task, status, kSwimlaneId, container);
            }
            // Mettre à jour le compteur
            //this.updateCounter(status, kSwimlaneId);
          });

        })
      })
    });
  }

  //---------------------------------------------------------------------------------------
  XupdateCounter(status) {
    const column = document.querySelector(`.kanban-column[data-status="${status}"]`);
    const countElement = column.querySelector('.kanban-count');
    const count = column.querySelectorAll('.kanban-item').length;
    countElement.textContent = count;
  }

  // Mettre à jour le compteur de tâches
  updateCounter(status, swimlaneId) {
    const column = document.querySelector(`.kanban-column[data-status="${status}"][data-swimlane-id="${swimlaneId}"]`);
    const countElement = column.querySelector('.kanban-count');
    const count = column.querySelectorAll('.kanban-item').length;
    countElement.textContent = count;
  }

  // Créer un élément de tâche
  createTaskElement(task, status, swimlaneId, container) {
    const taskElement = document.createElement('div');
    taskElement.className = 'kanban-item';
    taskElement.draggable = true;
    taskElement.dataset.taskId = task.id;
    taskElement.dataset.status = status;
    taskElement.dataset.swimlaneId = swimlaneId;

    taskElement.innerHTML = `
            <div class="kanban-item-header">
                <div class="kanban-item-title">${task.title}</div>
                <button class="edit-task-btn" data-task-id="${task.id}">Edit</button>
            </div>
            <div class="kanban-item-description">${task.description}</div>
            <div class="kanban-item-swimlane">Swimlane ${swimlaneId}</div>
        `;

    container.appendChild(taskElement);

    // Ajouter les événements de drag and drop
    taskElement.addEventListener('dragstart', handleDragStart);
    taskElement.addEventListener('dragend', handleDragEnd);

    // Ajouter l'événement pour éditer la tâche
    const editBtn = taskElement.querySelector('.edit-task-btn');
    editBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      openEditPopup(task.id, task.title, task.description, status, swimlaneId);
    });
  }


  // Gestion du drag and drop
  handleDragStart(e) {
    draggedItem = this;
    this.classList.add('dragging');
    e.dataTransfer.setData('text/plain', this.dataset.taskId);
    e.dataTransfer.effectAllowed = 'move';
  }

  handleDragEnd() {
    this.classList.remove('dragging');
  }

  // Mettre à jour le compteur de tâches
  updateCounter(status) {
    const column = document.querySelector(`.kanban-column[data-status="${status}"]`);
    const countElement = column.querySelector('.kanban-count');
    const count = column.querySelectorAll('.kanban-item').length;
    countElement.textContent = count;
  }

}



export { KanbanPanel }