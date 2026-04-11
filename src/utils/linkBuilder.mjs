  
import { ProjectDialog} from '../classes/ProjectDialog.mjs'
import { SwimlaneDialog } from '../classes/SwimlaneDialog.mjs'
import { ColumnDialog } from '../classes/ColumnDialog.mjs'

class LinkCounter {
  static counter=0
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
      swimlane.modify(sId);
    }
    href.addEventListener('click', editSwimlaneFn, { once: true });
    return (href)
  }

  //----------------------------------------------------------------------------------
  function buildColumnLink(columnId, columnName) {
    const href = document.createElement("a")
    LinkCounter.counter++
    href.setAttribute("id", `columnHref_${columnId}_${LinkCounter.counter}`)
    href.setAttribute("href", "javascript:void(0)")
    href.innerHTML = `${columnName}`
    //let myProject = this.project
    let cId=columnId
    let editColumnFn = function (ev) {
      console.log("editColumnHref event Listener fired ")
      ev.stopPropagation();
      const column = new ColumnDialog()
      column.modify(cId);
    }
    href.addEventListener('click', editColumnFn, { once: true });
    return (href)
  }

  export { buildProjectLink, buildSwimlaneLink , buildColumnLink }