import { KanboardFilter } from "./KanboardFilter.mjs"
import { Kontext } from "./Kontext.mjs"
import { Task } from "./Task.mjs"
import { ProjectManager } from "./ProjectManager.mjs"
import { SwimlaneDialog } from "./SwimlaneDialog.mjs"
import { ColumnDialog } from "./ColumnDialog.mjs"
import { Ref } from "./Ref.mjs"

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

    let projectId = this.project.id

    const addSwimlaneButton = document.createElement('button')
    addSwimlaneButton.classList.add("add-item-btn")
    addSwimlaneButton.setAttribute("id", "addSwimlaneButton")
    addSwimlaneButton.setAttribute("data-project-id", this.project.id)
    addSwimlaneButton.innerHTML = "+S"
    let addSwimlaneFn = function (ev) {
      console.log("addSwimlaneButton event Listener fired")
      ev.stopPropagation();
      const swimlane = new SwimlaneDialog('create', projectId);
    }
    removeEventListener("click", addSwimlaneFn)
    addSwimlaneButton.addEventListener('click', addSwimlaneFn);


    const addColumnButton = document.createElement('button')
    addColumnButton.classList.add("add-item-btn")
    addColumnButton.setAttribute("data-project-id", this.project.id)
    addColumnButton.innerHTML = "+C"
    let addColumnFn = function (ev) {
      console.log("addColumnButton event Listener fired")
      ev.stopPropagation();
      const column = new ColumnDialog('create', projectId);
    }
    removeEventListener("click", addColumnFn)
    addColumnButton.addEventListener('click', addColumnFn);

    let resultTitle = document.createElement('h2')
    resultTitle.appendChild(addSwimlaneButton)
    resultTitle.appendChild(addColumnButton)
    let title = document.createElement("span")
    title.innerHTML = `${this.project.name} filtered by ...`
    resultTitle.appendChild(title)
    document.getElementById(this.htmlElement).replaceChildren(resultTitle)

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
        //console.log("buildkColumnsDivsForProject(project) col=", col)
        const kColumnDiv = document.createElement('div')
        kColumnDiv.classList.add("kanban-column")
        kColumnDiv.setAttribute("data-column-id", col.id)
        kColumnDiv.setAttribute("data-swimlane-id", swimlane.id)

        // create kanban-column-header
        const kColumnHeaderDiv = document.createElement('div')
        kColumnHeaderDiv.setAttribute("data-swimlane-id", swimlane.id)
        kColumnHeaderDiv.classList.add("kanban-column-header")

        // fillin column header
        const kColumnHeaderDivH3 = document.createElement('h3')
        kColumnHeaderDivH3.innerHTML = col.name
        const kCounterDiv = document.createElement('span')
        kCounterDiv.classList.add("kanban-count")
        kCounterDiv.setAttribute("id", `counter:${project.id}:${swimlane.id}:_:${col.id}`)
        kCounterDiv.innerHTML = 0

        // create kanban-items
        const kColumnItemsDiv = document.createElement('div')
        kColumnItemsDiv.classList.add("kanban-items")
        kColumnItemsDiv.setAttribute("data-column-id", col.id)
        kColumnItemsDiv.setAttribute("data-swimlane-id", swimlane.id)

        const addButtonDiv = document.createElement('button')
        addButtonDiv.classList.add("add-item-btn")
        addButtonDiv.setAttribute("data-swimlane-id", swimlane.id)
        addButtonDiv.setAttribute("data-column-id", col.id)
        addButtonDiv.innerHTML = "+T"

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
      //console.log(this.kColumns)
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
    //console.log(zones)
    zones.forEach((zone) => {
      //console.log("listener", zone)
      project = this.project
      zone.addEventListener('dragover', (ev) => {
        //console.log("dragover", zone)
        ev.preventDefault()
        zone.classList.add("drag-over")
      })
      zone.addEventListener('dragleave', (ev) => {
        zone.classList.remove("drag-over")
      })
      zone.addEventListener('drop', (ev) => {
        console.log("Drop starting for zone ", zone)
        ev.preventDefault()
        zone.classList.remove("drag-over")
        const data = ev.dataTransfer.getData("dragId");
        let taskElement = document.getElementById(data)

        //remove old taskElment
        taskElement.parentElement.removeChild(taskElement)

        //---------------------------------------------------------------------------
        // Todo 
        // - update task in Kontext  
        // - save task to database
        // Beware : swimlane may change, update id too in db and in task div Id !!!!!!!!!!!!!!!
        // - update taskElement dragId :  update dragstart eventListener (remove/add) 
        // - update the DOM
        //------------------------------------------------------------------------------------

        let ref = taskElement.getAttribute("id")
        let [name, pId, sId, tId, cId] = Ref.getIdsFromRef(ref)
        let [name1, project, swimlane, taskO, column] = Ref.getObjectsFromRef(ref)

        const task = new Task(taskO)
        task.setRef(ref)

        let kanbanColumn = ev.target.closest(".kanban-column")
        let targetSwimlaneId = kanbanColumn.getAttribute("data-swimlane-id")
        let targetColumnId = kanbanColumn.getAttribute("data-column-id")
        // get a new ref with new swimlaneId and new columnId
        let newRef = Ref.getRef(name, pId, targetSwimlaneId, tId, targetColumnId)

        // update task in context
        task.setColumn(targetColumnId)
        task.setSwimlane(swimlane.id, targetSwimlaneId)
        task.setRef(newRef)
        task.setData("column_id", targetColumnId)
        task.setData("swimlane_id", targetSwimlaneId)
        task.patch()
        const taskElementNew = task.createKanbanTaskElement()

        // update the DOM
        // If drop over column (ex :empty column, appendChild)
        // Drop over another taskElement : must insert before it (choice, seems most convenient)
        let itemsDiv = ev.target.closest(".kanban-items")
        if (ev.target === itemsDiv) {
          itemsDiv.appendChild(taskElementNew)
        } else {
          itemsDiv.insertBefore(taskElementNew, ev.target)
        }
        this.updateCounter(cId, sId)
        this.updateCounter(targetColumnId, targetSwimlaneId)
      })

    })
    document.querySelectorAll('.kanban-item-header button, .kanban-item-name, .kanban-item-description').forEach(el => {
      el.addEventListener('dragstart', function (e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      });
    });
  };

  //------------------------------------------------------------------------
  // Searh if task in swimlane/column
  // status is column 
  //------------------------------------------------------------------------
  loadTasksForProject(project) {
    const kSwimlanes = document.querySelectorAll('.kanban-swimlane');
    kSwimlanes.forEach(kSwimlane => {
      const kSwimlaneId = kSwimlane.dataset.swimlaneId;
      const kColumns = kSwimlane.querySelectorAll('.kanban-column');

      kColumns.forEach(kColumn => {
        //console.log("dataset", kColumn.dataset)
        const columnId = kColumn.dataset.columnId;
        const container = kColumn.querySelector('.kanban-items');
        container.innerHTML = '';

        if (project.swimlanes[kSwimlaneId]) {
          Object.entries(project.swimlanes[kSwimlaneId].tasks).forEach(([tKey, task]) => {
            if (task.column_id == columnId) {
              const newTask = new Task(task)
              container.appendChild(newTask.createKanbanTaskElement());


              //document.getElementById(project.id).addEventListener("taskModified", (ev) => {
              document.addEventListener("taskModified", (ev) => {
                console.log("taskModified listener <ev>", ev)
              })

              //Mettre à jour le compteur
              this.updateCounter(columnId, kSwimlaneId);
            }
          })
        }
      })
    }
    );
  }

  //---------------------------------------------------------------------------------------
  updateCounter(columnId, swimlaneId) {
    const column = document.querySelector(`.kanban-column[data-column-id="${columnId}"][data-swimlane-id="${swimlaneId}"]`);
    const countElement = column.querySelector('.kanban-count');
    const count = column.querySelectorAll('.kanban-item').length;
    countElement.textContent = count;
  }

}

export { KanbanPanel }