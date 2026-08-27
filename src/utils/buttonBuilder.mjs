
import { ProjectDialog } from "../classes/ProjectDialog.mjs"
import { SwimlaneDialog } from "../classes/SwimlaneDialog.mjs"
import { WorkspaceDialog } from "../classes/WorkspaceDialog.mjs"
import { ColumnDialog } from "../classes/ColumnDialog.mjs"
import { TaskDialog } from "../classes/TaskDialog.mjs"
import { Task } from "../classes/Task.mjs"
import { ProjectsRights } from "../classes/ProjectsRights.mjs"
import { WorkspacesRights } from "../classes/WorkspacesRights.mjs"
import { sendEvent } from "./sendEvent.mjs"
import { Kontext } from "../classes/Kontext.mjs"
import { TasksCommentsModal } from "../classes/TasksCommentsModal.mjs"

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
    swimlane.create({ projectId: projectId });
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
    column.create({ projectId: projectId });
  }
  //removeEventListener("click", addColumnFn)
  addColumnButton.addEventListener('click', addColumnFn, { once: true });
  return (addColumnButton)
}

//------------------------------------------------------------------------
function buildAddTaskButton(swimlaneId, columnId) {
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
    task.create({ swimlaneId: swimlaneId, columnId: columnId });
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
    project.create({ workspaceId: workspaceId });
  }
  addProjectButton.addEventListener('click', addProjectFn, { once: true });
  return (addProjectButton)
}


//------------------------------------------------------------------------
function buildAddProjectsRightsButton(boxId,userId) {
  console.log("buildAddProjectsRightsButton event Listener fired", "userId", userId)
  const addProjectsRightsButton = document.createElement('button')
  addProjectsRightsButton.classList.add("add-item-btn")
  addProjectsRightsButton.setAttribute("id", "addProjectsRightsButton")
  addProjectsRightsButton.innerHTML = "+R"
  let addProjectsRightsFn = function (ev) {
    console.log("addProjectsRightsButton event Listener fired", ev.target)
    let el = document.getElementById("kanbearProjectsRightsSelectBox")
    console.log("addProjectsRightsButton event Listener fired, selected", el.value)
    ev.stopPropagation();
    let projectId = parseInt(document.getElementById(boxId).value)
    if (projectId > 0) {
      const projectsRights = new ProjectsRights('projectsRights',{})
      projectsRights.setData("project_id",projectId)
      projectsRights.setData("user_id",userId)
      projectsRights.create()
      //projectsRights.create();
      sendEvent('projectsRightsCreated', {})
    } else {
      alert("Select a project to add user to")
    }
  }
  //removeEventListener("click", addSwimlaneFn)
  addProjectsRightsButton.addEventListener('click', addProjectsRightsFn, { once: false });
  return (addProjectsRightsButton)
}


//------------------------------------------------------------------------
function buildAddWorkspacesRightsButton(boxId,userId) {
  console.log("buildAddWorkspacesRightsButton event Listener fired", "userId", userId)
  const addWorkspacesRightsButton = document.createElement('button')
  addWorkspacesRightsButton.classList.add("add-item-btn")
  addWorkspacesRightsButton.setAttribute("id", "addWorkspacesRightsButton")
  addWorkspacesRightsButton.innerHTML = "+R"
  let addWorkspacesRightsFn = function (ev) {
    console.log("addWorkspacesRightsButton event Listener fired", ev.target)
    let el = document.getElementById("kanbearWorkspacesRightsSelectBox")
    console.log("addWorkspacesRightsButton event Listener fired, selected", el.value)
    ev.stopPropagation();
    let workspaceId = parseInt(document.getElementById(boxId).value)
    if (workspaceId > 0) {
      const workspacesRights = new WorkspacesRights('workspacesRights',{})
      workspacesRights.setData("workspace_id",workspaceId)
      workspacesRights.setData("user_id",userId)
      workspacesRights.create()
      //projectsRights.create();
      sendEvent('workspacessRightsCreated', {})
    } else {
      alert("Select a workspaces to add user to")
    }
  }
  //removeEventListener("click", addSwimlaneFn)
  addWorkspacesRightsButton.addEventListener('click', addWorkspacesRightsFn, { once: false });
  return (addWorkspacesRightsButton)
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
function buildAddDummyButton(parms = { inner: "?", alert: "Message" }) {
  const addDummyButton = document.createElement('button')
  addDummyButton.classList.add("add-item-btn")
  addDummyButton.setAttribute("id", `addDummyButton`)
  //addTaskButton.innerHTML = "+\u{1F3CB}"
  addDummyButton.innerHTML = parms?.inner || "inner"
  let addDummyFn = function (ev) {
    console.log("addDummyButton event Listener fired")
    ev.stopPropagation();
    alert(parms?.message || "message")
  }
  addDummyButton.addEventListener('click', addDummyFn, { once: false });
  return (addDummyButton)
}

//------------------------------------------------------------------------
function buildAddNoteButton(taskId, taskEntity) {
  const addNoteButton = document.createElement('button')
  addNoteButton.classList.add("add-item-btn")
  addNoteButton.setAttribute("id", `addNoteButton`)
  //addTaskButton.innerHTML = "+\u{1F3CB}"
  addNoteButton.innerHTML = 'No'
  let addNoteFn = async function (ev) {
    console.log("addNoteButton event Listener fired")
    ev.stopPropagation();
    let note = prompt("Note for task ")
    if (note === null) {
      return
    }
    taskEntity.setData("note", note)
    await taskEntity.patch({ "note": note })
    sendEvent("taskModified", { id: taskId, item: { field: 'note', value: note } })
  }
  addNoteButton.addEventListener('click', addNoteFn, { once: false });
  return (addNoteButton)
}

//------------------------------------------------------------------------
function buildTasksCommentsButton(taskId, name) {
  const tasksCommentsButton = document.createElement('button')
  tasksCommentsButton.classList.add("add-item-btn")
  tasksCommentsButton.setAttribute("id", `tasksCommentsButton`)
  //addTaskButton.innerHTML = "+\u{1F3CB}"
  tasksCommentsButton.innerHTML = name
  let tasksCommentsFn = async function (ev) {
    console.log("tasksCommentsButton event Listener fired")
    ev.stopPropagation();
    let modal = new TasksCommentsModal(taskId)
  }
  tasksCommentsButton.addEventListener('click', tasksCommentsFn, { once: false });
  return (tasksCommentsButton)
}

//------------------------------------------------------------------------
function buildAddOpenCloseButton(id, value, callback) {
  const addAddOpenCloseButton = document.createElement('button')
  addAddOpenCloseButton.classList.add("add-item-btn")
  addAddOpenCloseButton.setAttribute("id", `addAddOpenCloseButton_${id}`)
  value ? addAddOpenCloseButton.innerHTML = 'O/c' : addAddOpenCloseButton.innerHTML = 'o/C'
  let addAddOpenCloseFn = function (ev) {
    console.log("addAddOpenCloseButton event Listener fired")
    ev.stopPropagation();
    callback(!value)
  }
  addAddOpenCloseButton.addEventListener('click', addAddOpenCloseFn, { once: false });
  return (addAddOpenCloseButton)
}

export {
  buildAddColumnButton,
  buildAddSwimlaneButton,
  buildAddTaskButton,
  buildAddProjectButton,
  buildAddProjectsRightsButton,
  buildAddWorkspacesRightsButton,
  buildAddWorkspaceButton,
  buildAddDummyButton,
  buildAddNoteButton,
  buildAddOpenCloseButton,
  buildTasksCommentsButton
}
