  
import { ProjectDialog} from '../classes/ProjectDialog.mjs'
import { SwimlaneDialog } from '../classes/SwimlaneDialog.mjs'
  
  //------------------------------------------------------------------------
  function buildProjectLink(projectId, projectName) {
    const href = document.createElement("a")
    href.setAttribute("id", `projectHref_${projectId}`)
    href.setAttribute("href", "javascript:void(0)")
    href.innerHTML = `${projectName}`
    //let myProject = this.project
    let pId=projectId
    let editProjectFn = function (ev) {
      console.log("editProjectHref event Listener fired ")
      ev.stopPropagation();
      const project = new ProjectDialog()
      project.modify(pId);
    }
    href.addEventListener('click', editProjectFn, { once: true });
    return (href)
  }

  //----------------------------------------------------------------------------------
  function buildSwimlaneLink(swimlaneId, swimlaneName) {
    const href = document.createElement("a")
    href.setAttribute("id", `swimlaneHref_${swimlaneId}`)
    href.setAttribute("href", "javascript:void(0)")
    href.innerHTML = `${swimlaneName}`
    //let myProject = this.project
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

  export { buildProjectLink, buildSwimlaneLink }