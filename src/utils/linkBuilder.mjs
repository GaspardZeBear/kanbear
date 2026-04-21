  
import { ProjectDialog} from '../classes/ProjectDialog.mjs'
import { SwimlaneDialog } from '../classes/SwimlaneDialog.mjs'
import { ColumnDialog } from '../classes/ColumnDialog.mjs'
import { WorkspaceDialog } from '../classes/WorkspaceDialog.mjs'
import { AssigneeDialog } from '../classes/AssigneeDialog.mjs'

class LinkCounter {
  static counter=0
}

//------------------------------------------------------------------------
  function buildWorkspaceLink(workspaceId, workspaceName) {
    const href = document.createElement("a")
    LinkCounter.counter++
    //href.setAttribute("id", `projectHref_${projectId}_${LinkCounter.counter}`)
    href.setAttribute("href", "javascript:void(0)")
    href.innerHTML = `${workspaceName}`
    let wId=workspaceId
    let editWorkspaceFn = function (ev) {
      console.log("editWorkspaceHref event Listener fired ")
      ev.stopPropagation();
      const workspace = new WorkspaceDialog()
      workspace.modify({workspaceId:wId});
    }
    href.addEventListener('click', editWorkspaceFn, { once: true });
    return (href)
  }


  //------------------------------------------------------------------------
  function buildProjectLink(projectId, projectName) {
    const href = document.createElement("a")
    LinkCounter.counter++
    href.setAttribute("id", `projectHref_${projectId}_${LinkCounter.counter}`)
    href.setAttribute("href", "javascript:void(0)")
    href.innerHTML = `${projectName}`
    let pId=projectId
    let editProjectFn = function (ev) {
      console.log("editProjectHref event Listener fired ")
      ev.stopPropagation();
      const project = new ProjectDialog()
      project.modify({projectId:pId});
    }
    href.addEventListener('click', editProjectFn, { once: true });
    return (href)
  }

  //----------------------------------------------------------------------------------
  function buildSwimlaneLink(swimlaneId, swimlaneName) {
    const href = document.createElement("a")
    LinkCounter.counter++
    href.setAttribute("id", `swimlaneHref_${swimlaneId}_${LinkCounter.counter}`)
    href.setAttribute("href", "javascript:void(0)")
    href.innerHTML = `${swimlaneName}`
    let sId=swimlaneId
    let editSwimlaneFn = function (ev) {
      console.log("editSwimlaneHref event Listener fired ")
      ev.stopPropagation();
      const swimlane = new SwimlaneDialog()
      swimlane.modify({swimlaneId:sId});
    }
    href.addEventListener('click', editSwimlaneFn, { once: true });
    return (href)
  }

  //----------------------------------------------------------------------------------
  function buildColumnLink(columnId, columnName) {
    const href = document.createElement("a")
    LinkCounter.counter++
    //href.setAttribute("id", `columnHref_${columnId}_${LinkCounter.counter}`)
    href.setAttribute("href", "javascript:void(0)")
    href.innerHTML = `${columnName}`
    //let myProject = this.project
    let cId=columnId
    let editColumnFn = function (ev) {
      console.log("editColumnHref event Listener fired ")
      ev.stopPropagation();
      const column = new ColumnDialog()
      column.modify({columnId:cId});
    }
    href.addEventListener('click', editColumnFn, { once: true });
    return (href)
  }

  //----------------------------------------------------------------------------------
  function buildAssigneeLink(assigneeId, assigneeName) {
    const href = document.createElement("a")
    LinkCounter.counter++
    //href.setAttribute("id", `columnHref_${columnId}_${LinkCounter.counter}`)
    href.setAttribute("href", "javascript:void(0)")
    href.innerHTML = `${assigneeName}`
    //let myProject = this.project
    let aId=assigneeId
    let editAssigneeFn = function (ev) {
      console.log("editAssigneeHref event Listener fired ")
      ev.stopPropagation();
      const assignee = new AssigneeDialog()
      assignee.modify({assigneeId:aId});
    }
    href.addEventListener('click', editAssigneeFn, { once: true });
    console.log(href)
    return(href)
  }

  export { buildAssigneeLink, buildWorkspaceLink, buildProjectLink, buildSwimlaneLink , buildColumnLink }