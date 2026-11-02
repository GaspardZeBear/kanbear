import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'
import { ProjectsRights } from './ProjectsRights.mjs'
import { Project } from './Project.mjs'
import { Rights } from './Rights.mjs'
import { Workspace } from './Workspace.mjs'
//import { UserRightsDialog } from './UserRightsDialog.mjs'
import { sendEvent } from '../utils/sendEvent.mjs'
import { formatDuration, dateToString, getDurationFromNow } from "../utils/dateAndTime.mjs";
import { selectBoxBuilder } from '../utils/selectBoxBuilder.mjs';
//import { buildAddProjectsRightsButton, buildAddWorkspacesRightsButton } from '../utils/buttonBuilder.mjs'
import { buildAddRightsButton } from '../utils/buttonBuilder.mjs'


// Rights flags
const REFERENCEFLAG = 4
const READFLAG = 2
const WRITEFLAG = 1
const DELETEFLAG = 8
const ISADMINFLAG = 16

class RightsModal {


  //------------------------------------------------------------------------
  constructor(ownerType, ownerId, ownerName) {
    this.ownerType = ownerType
    this.ownerId = ownerId
    this.ownerName = ownerName
    this.dialog = document.getElementById(`rightsModal`)
    //document.getElementById(`taskCommentsDialogTitle`).innerHTML="www"
    this.dialog.showModal();
    this.htmlElement = `rightsModalResults`
    this.createListeners(this)
    this.render()
  }

  //-----------------------------------------------------------------
  async render() {
    console.log("RightsModal render() fired")
    const result = document.getElementById(this.htmlElement);
    //document.getElementById(this.htmlElement).innerHTML = `<h2>${this.project.name} filtered by ...</h2>`

    let resultTitleRights = document.createElement('h3')
    let exitRightsButton = this.buildExitRightsButton()
    resultTitleRights.appendChild(exitRightsButton)
    let saveRightsButton = this.buildSaveRightsButton()
    resultTitleRights.appendChild(saveRightsButton)
    result.replaceChildren(resultTitleRights)
    this.workspaces = await Workspace.getAll('workspaces', {})
    this.workspacesHash = {}
    this.workspaces.forEach((w) => {
      this.workspacesHash[w.id] = w
    })
    this.projects = await Project.getAll('projects', {})
    console.log("RightModal render() before", this.projects)
    //this.projects.forEach((p) => {
    //  p.name = `${this.workspacesHash[p.workspace_id].name}/${p.name}/#${p.id}`
    //})
    console.log("RightModal render() after", this.projects)
    result.appendChild(await this.renderWorkspaces())
    result.appendChild(await this.renderProjects())
  }

  //-----------------------------------------------------------------------------
  async getRightsList(kind) {
    const rightsEntity = new Rights({ ownerId: this.ownerId })
    let rightsList = await rightsEntity.getByUserId()
    console.log("RightsModal this.getRightsList() ", rightsList)
    return (rightsList
      .filter((right) => right.target_kind === kind && right.owner_type === this.ownerType))
  }

  //-----------------------------------------------------------------
  async renderProjects() {
    let projectsDiv = document.createElement("div")
    let titleprojectsRights = document.createElement('span')
    titleprojectsRights.innerHTML = `Projects rights list for owner <b>${this.ownerName}</b> filtered by .....`
    projectsDiv.replaceChildren(titleprojectsRights)

    let projectsSelectBox = await this.buildProjectsSelectBox()
    projectsDiv.appendChild(projectsSelectBox)

    //const projectsRightsEntity = new ProjectsRights({ ownerId: this.ownerId })
    //let rightsList = await projectsRightsEntity.getByUserId()

    let rightsList = await this.getRightsList('project')
    let projectsTable = await this.createTable('Projects', rightsList)
    projectsDiv.appendChild(projectsTable)
    return (projectsDiv)
  }

  //-----------------------------------------------------------------
  async renderWorkspaces() {
    let workspacesDiv = document.createElement("div")
    let titleWorkspacesRights = document.createElement('span')
    titleWorkspacesRights.innerHTML = `Workspaces rights list for owner <b>${this.ownerName}</b> filtered by .....`
    workspacesDiv.replaceChildren(titleWorkspacesRights)

    let workspacesSelectBox = await this.buildWorkspacesSelectBox()
    workspacesDiv.appendChild(workspacesSelectBox)

    //const workspacesRightsEntity = new Rights({ ownerId: this.ownerId })
    //let rightsList = await workspacesRightsEntity.getByUserId()
    let rightsList = await this.getRightsList('workspace')
    let workspacesTable = await this.createTable('Workspaces', rightsList)
    workspacesDiv.appendChild(workspacesTable)
    return (workspacesDiv)
  }

  //---------------------------------------------------------------------
  async createListeners(thisClass) {
    document.addEventListener("projectsRightsCreated", async (ev) => {
      console.log("RightsModal() projectsRightsCreated listener fired <ev>", ev)
      thisClass.render()
    })
    document.addEventListener("workspacesRightsCreated", async (ev) => {
      console.log("RightsModal() workspacesRightsCreated listener fired <ev>", ev)
      thisClass.render()
    })
  }

  //------------------------------------------------------------------------
  buildExitRightsButton() {
    const exitRightsButton = document.createElement('button')
    exitRightsButton.classList.add("add-item-btn")
    exitRightsButton.setAttribute("id", "exitRightsButton")
    exitRightsButton.innerHTML = "Exit"
    const myThis = this
    let exitRightsFn = async function (ev) {
      console.log("exitRightsButton event Listener fired")
      ev.stopPropagation();
      document.getElementById(`rightsModal`).close()
    }
    //let dialog = document.getElementById(`projectsRightsModal`)
    exitRightsButton.addEventListener('click', exitRightsFn, { once: true });
    return (exitRightsButton)
  }

  //------------------------------------------------------------------------
  saveRights() {
    let hiddenRights = document.querySelectorAll(".hiddenRights")
    for (let r of hiddenRights) {
      //hiddenRights.forEach((r) => {
      console.log("UserRightsModal saveRights", r.id, r.value)
      let cRights = 0
      if (document.getElementById(`${r.id}:reference`).checked) {
        cRights += REFERENCEFLAG
      }
      if (document.getElementById(`${r.id}:read`).checked) {
        cRights += READFLAG
      }
      if (document.getElementById(`${r.id}:write`).checked) {
        cRights += WRITEFLAG
      }
      if (document.getElementById(`${r.id}:delete`).checked) {
        cRights += DELETEFLAG
      }
      if (document.getElementById(`${r.id}:isadmin`).checked) {
        cRights += ISADMINFLAG
      }
      console.log("UserRightsModal saveRights", r.id, r.value, "cRights", cRights)
      if (cRights != r.value) {
        console.log("UserRightsModal saveRights", r.id, " update")
        let [kind, rightsId, kindId, userId, dum0, dum1] = r.id.split(":")
        let rightsEntity
        rightsEntity = new Rights({})
        /*
        switch (kind) {
          case 'projects':
            rightsEntity = new Rights({})
            break
          case 'workspaces':
            rightsEntity = new Rights({})
            break
        }
            */
        rightsEntity.setId(rightsId)
        rightsEntity.setData("rights", cRights)
        //rightsEntity.setData("target_type", kind)
        rightsEntity.patch()
      }
    }
  }


  //------------------------------------------------------------------------
  buildSaveRightsButton() {
    const saveRightsButton = document.createElement('button')
    saveRightsButton.classList.add("add-item-btn")
    saveRightsButton.setAttribute("id", "saveRightsButton")
    saveRightsButton.innerHTML = "Save"
    const myThis = this
    let saveRightsFn = async function (ev) {
      console.log("saveRightsButton event Listener fired")
      ev.stopPropagation();
      myThis.saveRights()
      myThis.render()
      //document.getElementById(`rightsModal`).close()
    }
    //let dialog = document.getElementById(`projectsRightsModal`)
    saveRightsButton.addEventListener('click', saveRightsFn, { once: true });
    return (saveRightsButton)
  }

  //--------------------------------------------------------------
  async buildProjectsSelectBox() {
    //let projects = await Project.getAll('projects', {})

    let boxName = "kanbearProjectsRightsSelectBox"
    let buttons = [buildAddRightsButton(boxName, {
      ownerType: this.ownerType,
      ownerId: this.ownerId,
      targetKind: 'project',
    }, true)]
    let checkboxes = []
    let projects = []
    console.log("RightsModal buildProjectsSelectBox()", this.projects)
    //this.projects.forEach((p) => {
    //  p.name = `${this.workspacesHash[p.workspace_id].name}/${p.name}/#${p.id}`
    //  projects.push(p)
    //})
    let boxParams = {
      domId: boxName,
      boxLabel: "ProjectsRights",
      buttons: buttons,
      checkboxes: checkboxes,
      items: this.projects,
      labelText: "ProjectsRights",
      klass: "filter-group",
    }
    let prDiv = await selectBoxBuilder(boxParams)
    console.log("UserRightsModal <buildProjectsSelectBox()>", prDiv)
    return (prDiv)
  }

  //--------------------------------------------------------------
  async buildWorkspacesSelectBox() {
    //let workspaces = await Workspace.getAll('workspaces', {})

    let boxName = "kanbearWorkspacesRightsSelectBox"
    let buttons = [buildAddRightsButton(boxName, {
      ownerType: this.ownerType,
      ownerId: this.ownerId,
      targetKind: 'workspace',
    }, true)]
    let checkboxes = []
    let boxParams = {
      domId: boxName,
      boxLabel: "WorkspacesRights",
      buttons: buttons,
      checkboxes: checkboxes,
      items: this.workspaces,
      labelText: "WorkspacesRights",
      klass: "filter-group",
    }
    let wsDiv = await selectBoxBuilder(boxParams)
    console.log("UserRightsModal <buildProjectsSelectBox()>", wsDiv)
    return (wsDiv)
  }

  //------------------------------------------------------------------------
  getItemId(kind, action, id) {
    return (`${kind}:${id}:rights:${action}`)
  }

  //------------------------------------------------------------------------
  async createTable(kind, rightsList) {
    const lkinds = kind[0].toLowerCase() + kind.slice(1)
    const lkind = lkinds.slice(0, -1)

    console.log("UserRightsModal.createTable()", "kind", kind, "<rightsList>", rightsList)
    let table = document.createElement('table')
    const thead = document.createElement('thead')
    const hrow = document.createElement('tr')
    hrow.innerHTML = `
        <th>RightsId</th>
        <th>Kind</th>
        <th>${kind}Id</th>
        <th>${kind}Name</th>
        <th>isAdmin</th>
        <th>Delete</th>
        <th>Reference</th>
        <th>Read</th>
        <th>Write</th>
      `
    thead.appendChild(hrow)
    table.appendChild(thead)
    const tbody = document.createElement('tbody')


    const td = (p) => {
      const td = document.createElement('td')
      td.innerHTML = p
      return (td)
    }
    const tdHref = (href) => {
      const td = document.createElement('td')
      td.appendChild(href)
      return (td)
    }

    //Object.entries(projectsRightsList).forEach((projectsRightsEntity) => {
    Object.entries(rightsList).forEach((rightsItem) => {
      const rights = rightsItem[1]
      console.log("KanbearRightsPanel.createTable() <Rights>", rights)
      const row = document.createElement('tr');

      let kId = rights[`${lkind}_id`]
      let rightId = `${rights.id}:${kId}:${rights.user_id}`
      let hiddenRights = `<input type="hidden" class="hiddenRights" id="${lkinds}:${rightId}:rights" value="${rights.rights}">`
      row.appendChild(td(`${rights.id} ${hiddenRights}`))
      row.appendChild(td(kind))
      //row.appendChild(td(rights[`${lkind}_id`]))
      //row.appendChild(td(rights[`${lkind}_name`]))
      row.appendChild(td(rights[`target_id`]))
      switch (rights.target_kind) {
        case 'workspace':
          row.appendChild(td(rights[`target_name`]))
          break
        case 'project':
          let fqn = `${this.workspacesHash[rights.target_id].name}/${rights.target_name}/${rights.target_id}`
          row.appendChild(td(fqn))
          break
        default:
          row.appendChild(td("Bad kind"))
          break
      }
      let isadminChecked = ((rights.rights & ISADMINFLAG) > 0) ? "checked" : ""
      let deleteChecked = ((rights.rights & DELETEFLAG) > 0) ? "checked" : ""
      let referenceChecked = ((rights.rights & REFERENCEFLAG) > 0) ? "checked" : ""
      let readChecked = ((rights.rights & READFLAG) > 0) ? "checked" : ""
      let writeChecked = ((rights.rights & WRITEFLAG) > 0) ? "checked" : ""
      //let readId = `projectsRights_read_${rightId}`
      let isadminId = this.getItemId(lkinds, 'isadmin', rightId)
      row.appendChild(td(`<input class="userRightsCheckbox"
         type="checkbox"
         name="${rights.rights}"
         id="${isadminId}"
         ${isadminChecked}/>`))
      let deleteId = this.getItemId(lkinds, 'delete', rightId)
      row.appendChild(td(`<input class="userRightsCheckbox"
         type="checkbox"
         name="${rights.rights}"
         id="${deleteId}"
         ${deleteChecked}/>`))
      let referenceId = this.getItemId(lkinds, 'reference', rightId)
      row.appendChild(td(`<input class="userRightsCheckbox"
         type="checkbox"
         name="${rights.rights}"
         id="${referenceId}"
         ${referenceChecked}/>`))
      let readId = this.getItemId(lkinds, 'read', rightId)
      row.appendChild(td(`<input class="userRightsCheckbox"
         type="checkbox"
         name="${rights.rights}"
         id="${readId}"
         ${readChecked}/>`))
      //let writeId = `projectsRights_write_${rightId}`
      let writeId = this.getItemId(lkinds, 'write', rightId)
      row.appendChild(td(`<input class="userRightsCheckbox" 
         type="checkbox"
         id="${writeId}"
         ${writeChecked}/>`))

      tbody.appendChild(row);
    }
    );
    table.appendChild(tbody)
    return (table)
  }

}

export { RightsModal }
