import { KanboardFilter } from "./KanboardFilter.mjs"
import { Kontext } from "./Kontext.mjs"
import { Task } from "./Task.mjs"
import { ProjectManager } from "./ProjectManager.mjs"
import { ProjectDialog } from "./ProjectDialog.mjs"
import { SwimlaneDialog } from "./SwimlaneDialog.mjs"
import { ColumnDialog } from "./ColumnDialog.mjs"
import { TaskDialog } from "./TaskDialog.mjs"
import { buildProjectLink, buildSwimlaneLink, buildColumnLink } from "../utils/linkBuilder.mjs"
import { Ref } from "./Ref.mjs"

class KanbanPanel {
  //------------------------------------------------------------------------
  // Please, dont call it directly, use builder
  constructor(element, filtersMap) {
    this.projects = Kontext.getJsonBulkData()
    console.log("KanbanPanel.constructor() projectId", Kontext.getCurrentProjectId())
    this.project = Kontext.getJsonBulkData()[Kontext.getCurrentProjectId()] || undefined
    this.htmlElement = element
    this.kanboardFilter = new KanboardFilter(filtersMap)
    this.buttons = {}
    this.table = undefined
    this.kColumns = {}
  }
  //------------------------------------------------------------------------
  // hint to have a kind of async construtor
  //----------------------------------------------------------
  static async builder(element, filterMap) {
    console.log("KanbanPanel.reload()")
    await Kontext.loadKanbearJsonBulkData()
    console.log("KanbanPanel.reload() done")
    return new KanbanPanel(element, filterMap)
  }


  //------------------------------------------------------------------------
  buildAddSwimlaneButton(projectId) {
    //let projectId = this.project.id
    const addSwimlaneButton = document.createElement('button')
    addSwimlaneButton.classList.add("add-item-btn")
    addSwimlaneButton.setAttribute("id", "addSwimlaneButton")
    addSwimlaneButton.setAttribute("data-project-id", this.project.id)
    addSwimlaneButton.innerHTML = "+\u25A4"
    let addSwimlaneFn = function (ev) {
      console.log("addSwimlaneButton event Listener fired")
      ev.stopPropagation();
      const swimlane = new SwimlaneDialog('swimlane')
      swimlane.create({projectId:projectId});
    }
    //removeEventListener("click", addSwimlaneFn)
    addSwimlaneButton.addEventListener('click', addSwimlaneFn, { once: true });
    return (addSwimlaneButton)
  }


  //------------------------------------------------------------------------
  buildAddColumnButton(projectId) {
    //let projectId = this.project.id
    const addColumnButton = document.createElement('button')
    addColumnButton.classList.add("add-item-btn")
    addColumnButton.setAttribute("id", "addColumnButton")
    addColumnButton.setAttribute("data-project-id", this.project.id)
    addColumnButton.innerHTML = "+\u25A5"
    let addColumnFn = function (ev) {
      console.log("addColumnButton event Listener fired")
      ev.stopPropagation();
      const column = new ColumnDialog('column')
      column.create({projectId:projectId});
    }
    //removeEventListener("click", addColumnFn)
    addColumnButton.addEventListener('click', addColumnFn, { once: true });
    return (addColumnButton)
  }
  
  //------------------------------------------------------------------------
  buildAddTaskButton(swimlaneId,columnId) {
    const addTaskButton = document.createElement('button')
    addTaskButton.classList.add("add-item-btn")
    addTaskButton.setAttribute("id", `addTaskButton_${swimlaneId}_${columnId}`)
    addTaskButton.setAttribute("data-swimlane-id", swimlaneId)
    addTaskButton.setAttribute("data-column-id", columnId)
    addTaskButton.innerHTML = "+\u{1F3CB}"

    let addTaskFn = function (ev) {
      console.log("addTaskButton event Listener fired <swimlane>", swimlaneId, "<column>", columnId)
      ev.stopPropagation();
      const task = new TaskDialog('task')
      task.create({swimlaneId:swimlaneId, columnId:columnId});
    }
    addTaskButton.addEventListener('click', addTaskFn, { once: true });
    return (addTaskButton)
  }


  //------------------------------------------------------------------------
  async render() {
    console.log("KanbanPanel.render() <project>", this.project)
    let [displayable, cause] = new ProjectManager(this.project).isDisplayable()
    if (!displayable) {
      document.getElementById(this.htmlElement).innerHTML = `Project not displayable ${cause}`
      return
    }

    const addSwimlaneButton = this.buildAddSwimlaneButton(this.project.id)
    const addColumnButton = this.buildAddColumnButton(this.project.id)
    //const projectLink = this.buildProjectLink(this.project.id, this.project.name)
    const projectLink = buildProjectLink(this.project.id, this.project.name)

    //let resultTitleWorkspace = document.createElement('h2')
    //resultTitleWorkspace.innerHTML="Workspace " + this.project.workspace_id
    let resultTitleProject = document.createElement('h3')
    resultTitleProject.appendChild(addSwimlaneButton)
    resultTitleProject.appendChild(addColumnButton)
    let titleProject = document.createElement("span")
    titleProject.innerHTML = `Project `
    resultTitleProject.appendChild(titleProject)
    resultTitleProject.appendChild(projectLink)
    let filters = document.createElement("span")
    filters.innerHTML = " filtered by..."
    resultTitleProject.appendChild(filters)

    let resultTitle=document.createElement("div")
    //resultTitle.appendChild(resultTitleWorkspace)
    resultTitle.appendChild(resultTitleProject)

    document.getElementById(this.htmlElement).replaceChildren(resultTitle)

    this.buildKanbanDivsForProject(this.project)
    //this.buildkColumnsQuerySelectors(this.projects[0])
    this.setDropZones(this.project.id)
    this.loadTasksForProject(this.project)
  }

  //----------------------------------------------------------------------------------------
  buildKanbanDivsForProject(project) {
    console.log("buildKanbanDivsForProject", project)
    const kanbanDiv = document.createElement('div')
    kanbanDiv.classList.add("kanban-board")
    kanbanDiv.setAttribute("id", project.id)
    kanbanDiv.setAttribute("data-projectid", project.id)
    //const projectLink = buildProjectLink(project.id, project.name)

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
      const projectLink = buildProjectLink(project.id, project.name)
      const swimlaneLink = buildSwimlaneLink(swimlane.id, swimlane.name)
      kSwimlaneDivH2.innerHTML = `${project.name}::`
      //console.log(this.projectLink)
      kSwimlaneDivH2.appendChild(projectLink)
      kSwimlaneDivH2.appendChild(swimlaneLink)

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
        const columnLink = buildColumnLink(col.id, col.name)
        const kColumnHeaderDivH3 = document.createElement('h3')
        //kColumnHeaderDivH3.innerHTML = col.name
        kColumnHeaderDivH3.appendChild(columnLink)
        const kCounterDiv = document.createElement('span')
        kCounterDiv.classList.add("kanban-count")
        kCounterDiv.setAttribute("id", `counter:${project.id}:${swimlane.id}:_:${col.id}`)
        kCounterDiv.innerHTML = 0

        // create kanban-items
        const kColumnItemsDiv = document.createElement('div')
        kColumnItemsDiv.classList.add("kanban-items")
        kColumnItemsDiv.setAttribute("data-column-id", col.id)
        kColumnItemsDiv.setAttribute("data-swimlane-id", swimlane.id)

       const addTaskButton =this.buildAddTaskButton(swimlane.id,col.id)

        // link all
        kColumnHeaderDiv.appendChild(kColumnHeaderDivH3)
        kColumnHeaderDiv.appendChild(kCounterDiv)
        kColumnDiv.appendChild(kColumnHeaderDiv)
        kColumnDiv.appendChild(kColumnItemsDiv)
        kColumnHeaderDiv.appendChild(addTaskButton)
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
        //taskElement.parentElement.removeChild(taskElement)

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
        taskElement.parentElement.removeChild(taskElement)
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