
import { ProjectDialog } from "../classes/ProjectDialog.mjs"
import { SwimlaneDialog } from "../classes/SwimlaneDialog.mjs"
import { WorkspaceDialog } from "../classes/WorkspaceDialog.mjs"
import { ColumnDialog } from "../classes/ColumnDialog.mjs"
import { TaskDialog } from "../classes/TaskDialog.mjs"
  
  //------------------------------------------------------------------------
  function buildAddSwimlaneButton(projectId) {
    //let projectId = this.project.id
    const addSwimlaneButton = document.createElement('button')
    addSwimlaneButton.classList.add("add-item-btn")
    addSwimlaneButton.setAttribute("id", "addSwimlaneButton")
    addSwimlaneButton.setAttribute("data-project-id", projectId)
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
  function buildAddColumnButton(projectId) {
    //let projectId = this.project.id
    const addColumnButton = document.createElement('button')
    addColumnButton.classList.add("add-item-btn")
    addColumnButton.setAttribute("id", "addColumnButton")
    addColumnButton.setAttribute("data-project-id", projectId)
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
  function buildAddTaskButton(swimlaneId,columnId) {
    const addTaskButton = document.createElement('button')
    addTaskButton.classList.add("add-item-btn")
    addTaskButton.setAttribute("id", `addTaskButton_${swimlaneId}_${columnId}`)
    addTaskButton.setAttribute("data-swimlane-id", swimlaneId)
    addTaskButton.setAttribute("data-column-id", columnId)
    //addTaskButton.innerHTML = "+\u{1F3CB}"
    addTaskButton.innerHTML = "+\u{1F0F5}"
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
  function buildAddProjectButton(workspaceId) {
    const addProjectButton = document.createElement('button')
    addProjectButton.classList.add("add-item-btn")
    addProjectButton.setAttribute("id", `addProjectButton_${workspaceId}`)
    addProjectButton.setAttribute("data-workspace-id", workspaceId)
    //addTaskButton.innerHTML = "+\u{1F3CB}"
    addProjectButton.innerHTML = "+P"
    let addProjectFn = function (ev) {
      console.log("addProjectButton event Listener fired <workspaceId>", workspaceId)
      ev.stopPropagation();
      const project = new ProjectDialog('project')
      project.create({workspaceId:workspaceId});
    }
    addProjectButton.addEventListener('click', addProjectFn, { once: true });
    return (addProjectButton)
  }

  //------------------------------------------------------------------------
  function buildAddWorkspaceButton() {
    const addWorkspaceButton = document.createElement('button')
    addWorkspaceButton.classList.add("add-item-btn")
    addWorkspaceButton.setAttribute("id", `addWorkspaceButton`)
    //addTaskButton.innerHTML = "+\u{1F3CB}"
    addWorkspaceButton.innerHTML = "+W"
    let addWorkspaceFn = function (ev) {
      console.log("addWorkspaceButton event Listener fired")
      ev.stopPropagation();
      const workspace = new WorkspaceDialog('workspace')
      workspace.create({});
    }
    addWorkspaceButton.addEventListener('click', addWorkspaceFn, { once: true });
    return (addWorkspaceButton)
  }
  //------------------------------------------------------------------------
  function buildAddDummyButton() {
    const addDummyButton = document.createElement('button')
    addDummyButton.classList.add("add-item-btn")
    addDummyButton.setAttribute("id", `addDummyButton`)
    //addTaskButton.innerHTML = "+\u{1F3CB}"
    addDummyButton.innerHTML = "?"
    let addDummyFn = function (ev) {
      console.log("addDummyButton event Listener fired")
      ev.stopPropagation();
      alert("Select a workspace")
    }
    addDummyButton.addEventListener('click', addDummyFn, { once: false });
    return (addDummyButton)
  }

export { buildAddColumnButton, buildAddSwimlaneButton,buildAddTaskButton,buildAddProjectButton, buildAddWorkspaceButton, buildAddDummyButton}
