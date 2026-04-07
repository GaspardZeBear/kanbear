  
  import { ProjectDialog} from '../classes/ProjectDialog.mjs'
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

  export { buildProjectLink }