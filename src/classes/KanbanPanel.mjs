import { KanboardFilter } from "./KanboardFilter.mjs"
import { Kontext } from "./Kontext.mjs"
import { Task } from "./Task.mjs"
import { Project } from "./Project.mjs"
import { ProjectManager } from "./ProjectManager.mjs"
import { ProjectDialog } from "./ProjectDialog.mjs"
import { SwimlaneDialog } from "./SwimlaneDialog.mjs"
import { WorkspaceDialog } from "./WorkspaceDialog.mjs"
import { ColumnDialog } from "./ColumnDialog.mjs"
import { Columns } from "./Columns.mjs"
import { TaskDialog } from "./TaskDialog.mjs"
import { buildProjectLink, buildSwimlaneLink, buildColumnLink } from "../utils/linkBuilder.mjs"
import { getFiltersMap } from "../utils/filters.mjs"
import { Ref } from "./Ref.mjs"
import { buildAddColumnButton, buildAddTaskButton, buildAddSwimlaneButton, buildDeleteEntityButton } from "../utils/buttonBuilder.mjs"
import { getOpenCloseSymbol } from "../utils/openClose.mjs"
import { KanbearEntityFactory } from "./KanbearEntityFactory.mjs"
import { sendEvent } from "../utils/sendEvent.mjs"
import { createElement, getIdentityDiv } from "../utils/createHtml.mjs"
import { Swimlane } from "./Swimlane.mjs"
import { Column } from "./Column.mjs"
import { mustDisable, REFERENCE, READ, WRITE, DELETE, ISADMIN } from "../utils/rights.mjs"
import { KanbearProjectCleanor } from "./KanbearProjectCleanor.mjs"

class KanbanPanel {
  //------------------------------------------------------------------------
  // Please, dont call it directly, use builder
  constructor() {
    //this.projects = Kontext.getJsonBulkData()
    console.log("KanbanPanel.constructor() projectId", Kontext.getCurrentProjectId())
    this.project = undefined
    if (Kontext.getCurrentProjectId()) {
      console.log("KanbanPanel.constructor() ", Kontext.getJsonBulkData())
      this.project = Kontext.getJsonBulkData()[Kontext.getCurrentProjectId()]
      this.projectEntity = new Project(this.project)
    }
    this.orderedColumnsList = []

    console.log("KanbanPanel.constructor", "columnsOrder", this.project.jsonColumnsOrder)
    let columnAlready = new Set()

    for (let colId of this.project.jsonColumnsOrder) {
      // maybe column was deleted
      // or col twice 
      if (this.project.columns[colId] && !columnAlready.has(colId)) {
        this.orderedColumnsList.push(this.project.columns[colId])
        columnAlready.add(colId)
      }
    }

    //-------------------------------------------------------------------------
    // quick and dirty fix 
    if (this.project.jsonColumnsOrder.length !== columnAlready.size) {
      console.log("KanbanPanel unconsistent column Order", this.project.jsonColumnsOrder, " should be ", Array.from(columnAlready))
      // It's a promise, but don't worry about it
      new Project(this.project).resetColumnsOrder(Array.from(columnAlready))
    }

    //--------------------------------------------------------------
    //console.log("KanbanPanel.constructor() orderedColumnsList", this.orderedColumnsList)
    this.htmlElement = 'results'
    this.kanboardFilter = new KanboardFilter(getFiltersMap())
    this.buttons = {}
    this.table = undefined
    this.kColumns = {}
  }

  //------------------------------------------------------------------------
  // hint to have a kind of async construtor
  //----------------------------------------------------------
  static async builder() {
    console.log("KanbanPanel.builder() reload")
    await Kontext.loadKanbearJsonBulkData()
    console.log("KanbanPanel.builder() reloaddone")
    Kontext.setPanelClass(KanbanPanel)
    return new KanbanPanel()
  }

  //------------------------------------------------------------------------
  async render() {
    console.log("KanbanPanel.render() <project>", this.project)
    let [displayable, cause] = new ProjectManager(this.project).isDisplayable()
    if (!displayable) {
      document.getElementById(this.htmlElement).innerHTML = `Project not displayable ${cause}`
      return
    }

    let resultTitle = createElement('div', {
      classes: ["kanban-item-topline"],
      children: [
        getIdentityDiv(this.projectEntity, new ProjectDialog()),
        buildAddSwimlaneButton(this.project.id),
        buildAddColumnButton(this.project.id),
        createElement("span", {
          innerHTML: " filtered by..."
        }),
        buildDeleteEntityButton(this.projectEntity, mustDisable(DELETE), async () => {
          let cleanor=new KanbearProjectCleanor()
          await cleanor.cleanup()
          return(cleanor)
        })
      ]
    })

    const elementHeader = `${this.htmlElement}Header`
    document.getElementById(elementHeader).replaceChildren(resultTitle)
    document.getElementById(this.htmlElement).replaceChildren()


    this.buildKanbanDivsForProject(this.project)
    //this.buildkColumnsQuerySelectors(this.projects[0])
    this.setDropZonesForTasks(this.project.id)
    this.setDropZonesForColumnsHeaders(this.project.id)
    this.loadTasksForProject(this.project)
  }

  //-----------------------------------------------------------------------------
  getSwimlaneHeaderDiv(swimlaneEntity) {
    return (createElement('div', {
      classes: ["kanban-item-topline","kanban-swimlane-header"],
      children: [
        getIdentityDiv(swimlaneEntity, new SwimlaneDialog()),
        buildDeleteEntityButton(swimlaneEntity, mustDisable(DELETE), null)]
    }))
  }

  //-----------------------------------------------------------------------------
  getColumnHeaderCounterDiv(projectId, swimlaneId, columnId) {
    return (createElement('div', {
      classes: ["kanban-count"],
      id: `counter:${projectId}:${swimlaneId}:_:${columnId}`,
      textContent: "0"
    })
    )
  }

  //----------------------------------------------------------------------------------------
  buildKanbanDivsForProject(project) {
    console.log("buildKanbanDivsForProject", "this", this, "project", project)
    const kanbanDiv = createElement("div", {
      classes: ["kanban-board"],
      id: project.id,
      "data-projectid": project.id
    })

    //console.log("KanbanPanel.buildKanbanDivsForProject() ", orderedColumnsList)
    Object.entries(project.swimlanes).forEach(([sKey, swimlane]) => {
      let swimlaneEntity = new Swimlane(swimlane)
      if (!this.kanboardFilter.keepSwimlane(swimlane.name)) { return }
      const kSwimlaneDiv = createElement('div', {
        classes: ["kanban-swimlane"],
        "data-swimlane-id": swimlane.id,
        children: [this.getSwimlaneHeaderDiv(swimlaneEntity)
        ]
      })

      // create columns for this swimlane
      const kSwimlaneColumnsDiv = createElement('div', {
        classes: ["swimlane-columns"]
      })

      //Object.entries(project.columns).forEach(([tKey, col]) => {
      this.orderedColumnsList.forEach(col => {
        console.log("KanbanPanelbuildKanbanDivsForProject() ", "col", col)
        let columnEntity = new Column(col)
        const kColumnDiv = createElement('div', {
          classes: ["kanban-column"],
          "data-column-id": col.id,
          "data-swimlane-id": swimlane.id,
          "style": `background-color:${col.color}`
        })

        // create kanban-column-header
        const dragId = Ref.getRef('drag', project.id, swimlane.id, "_", col.id)

        console.log("KanbanPanel buildKanbanDivsForProject() columnEntity", columnEntity)
        const kColumnHeaderDiv = createElement('div', {
          classes: ["kanban-column-header","kanban-item-topline"],
          "data-swimlane-id": swimlane.id,
          "draggable": true,
          "data-column-id": col.id,
          "ondragstart": (ev) => {
            ev.dataTransfer.setData('dragId', dragId);
            ev.target.classList.add("dragging")
            ev.dataTransfer.effectAllowed = 'move';
          },
          "ondragend": (ev) => {
            ev.target.classList.remove("dragging")
          },
          children: [
            getIdentityDiv(columnEntity, new ColumnDialog()),
            this.getColumnHeaderCounterDiv(project.id, swimlane.id, col.id),
            buildAddTaskButton(swimlane.id, col.id),
            buildDeleteEntityButton(columnEntity, mustDisable(DELETE), null)
          ]
        })

        // create kanban-items
        const kColumnItemsDiv = createElement('div', {
          classes: ["kanban-items"],
          "data-column-id": col.id,
          "data-swimlane-id": swimlane.id
        })

        kColumnDiv.appendChild(kColumnHeaderDiv)
        kColumnDiv.appendChild(kColumnItemsDiv)
        kSwimlaneColumnsDiv.appendChild(kColumnDiv)
        kSwimlaneDiv.appendChild(kSwimlaneColumnsDiv)

      })
      kanbanDiv.appendChild(kSwimlaneDiv)
      //console.log(this.kColumns)
    })
    document.getElementById(this.htmlElement).appendChild(kanbanDiv)
  };

  //----------------------------------------------------------------------------------------
  setDropZonesForTasks(project) {
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
        console.log("Drop zone ", zone, " data ", data)
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


  //----------------------------------------------------------------------------------------
  setDropZonesForColumnsHeaders(project) {
    //console.log("setDropZones")
    this.kColumns[project.id] = {}
    const ch = `.kanban-column-header`
    //console.log("ch", ch)
    const zones = document.querySelectorAll(ch)
    //console.log(zones)
    zones.forEach((zone) => {
      //console.log("listener", zone)
      project = this.project
      zone.addEventListener('dragover', (ev) => {
        //console.log("dragover starting for column ", zone)
        //console.log("dragover", zone)
        ev.preventDefault()
        zone.classList.add("drag-over")
      })
      zone.addEventListener('dragleave', (ev) => {
        zone.classList.remove("drag-over")
      })
      zone.addEventListener('drop', async (ev) => {
        console.log("Drop starting for column ", zone)
        ev.preventDefault()
        zone.classList.remove("drag-over")
        const data = ev.dataTransfer.getData("dragId");
        const target = ev.target
        console.log("Drop data", data)
        let columnId = Ref.getColumnIdFromRef(data)

        //let columnId = target.getAttribute("data-column-id")
        let dropColumnDiv = ev.target.closest(".kanban-column")
        let dropColumnId = dropColumnDiv.getAttribute("data-column-id")

        let projectEntity = await KanbearEntityFactory.generate('project')
        projectEntity.setId(project.id)
        const project0 = await projectEntity.get('project', {})
        console.log("KanbanPanel.drag", project0, projectEntity)
        await projectEntity.dragColumn(project0.columns_order, parseInt(columnId), parseInt(dropColumnId))
        sendEvent(`columnDragged`, { columnId: columnId })
        //await new Columns({columnsList:this.orderedColumnsList}).drag(columnId,dropColumnId)
      })
    })

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
              if (!this.kanboardFilter.keepTask(task.name)) { return }
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