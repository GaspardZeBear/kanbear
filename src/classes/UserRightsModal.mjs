import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'
import { ProjectsRights } from './ProjectsRights.mjs'
import { Project } from './Project.mjs'
import { WorkspacesRights } from './WorkspacesRights.mjs'
import { Workspace } from './Workspace.mjs'
//import { UserRightsDialog } from './UserRightsDialog.mjs'
import { sendEvent } from '../utils/sendEvent.mjs'
import { formatDuration, dateToString, getDurationFromNow } from "../utils/dateAndTime.mjs";
import { selectBoxBuilder } from '../utils/selectBoxBuilder.mjs';
import { buildAddProjectsRightsButton, buildAddWorkspacesRightsButton } from '../utils/buttonBuilder.mjs'

// Rights flags
const REFERENCEFLAG = 4
const READFLAG = 2
const WRITEFLAG = 1

class UserRightsModal {


  //------------------------------------------------------------------------
  constructor(userId, userName) {
    this.userId = userId
    this.userName = userName
    this.dialog = document.getElementById(`rightsModal`)
    //document.getElementById(`taskCommentsDialogTitle`).innerHTML="www"
    this.dialog.showModal();
    this.htmlElement = `rightsModalResults`
    this.createListeners(this)
    this.render()
  }

  //-----------------------------------------------------------------
  async render() {
    const result = document.getElementById(this.htmlElement);
    //document.getElementById(this.htmlElement).innerHTML = `<h2>${this.project.name} filtered by ...</h2>`

    let resultTitleRights = document.createElement('h3')
    let exitRightsButton = this.buildExitRightsButton()
    resultTitleRights.appendChild(exitRightsButton)
    let saveRightsButton = this.buildSaveRightsButton()
    resultTitleRights.appendChild(saveRightsButton)
    result.replaceChildren(resultTitleRights)
    result.appendChild(await this.renderProjects())
    result.appendChild(await this.renderWorkspaces())
  }

  //-----------------------------------------------------------------
  async renderProjects() {
    let projectsDiv = document.createElement("div")
    let titleprojectsRights = document.createElement('span')
    titleprojectsRights.innerHTML = `Projects rights list for user <b>${this.userName}</b> filtered by .....`
    projectsDiv.replaceChildren(titleprojectsRights)

    let projectsSelectBox = await this.buildProjectsSelectBox()
    projectsDiv.appendChild(projectsSelectBox)

    const projectsRightsEntity = new ProjectsRights({ userId: this.userId })
    let rightsList = await projectsRightsEntity.getByUserId()
    let projectsTable = await this.createTable('Projects', rightsList)
    projectsDiv.appendChild(projectsTable)
    return (projectsDiv)
  }

  //-----------------------------------------------------------------
  async renderWorkspaces() {
    let workspacesDiv = document.createElement("div")
    let titleWorkspacesRights = document.createElement('span')
    titleWorkspacesRights.innerHTML = `Workspaces rights list for user <b>${this.userName}</b> filtered by .....`
    workspacesDiv.replaceChildren(titleWorkspacesRights)

    let workspacesSelectBox = await this.buildWorkspacesSelectBox()
    workspacesDiv.appendChild(workspacesSelectBox)

    const workspacesRightsEntity = new WorkspacesRights({ userId: this.userId })
    let rightsList = await workspacesRightsEntity.getByUserId()
    let workspacesTable = await this.createTable('Workspaces', rightsList)
    workspacesDiv.appendChild(workspacesTable)
    return (workspacesDiv)
  }

  //---------------------------------------------------------------------
  async createListeners(thisClass) {
    document.addEventListener("projectsRightsCreated", async (ev) => {
      console.log("UserRightsModal() projectsRightsCreated listener fired <ev>", ev)
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
    exitRightsButton.addEventListener('click', exitRightsFn, { once: false });
    return (exitRightsButton)
  }

  //------------------------------------------------------------------------
  saveRights() {
    let rights = document.querySelectorAll(".hiddenProjectsRights")
    rights.forEach((r) => {
      console.log("UserRightsModal saveRights", r.id, r.value)
      let readId = this.getItemId('projects', 'read', r.id)
      console.log("UserRightsModal saveRights readId", readId)
      console.log("UserRightsModal saveRights checked", document.getElementById(readId).checked)
      let cRights = 0
      if (document.getElementById(readId).checked) {
        cRights += READFLAG
      }
      let writeId = this.getItemId('projects', 'write', r.id)
      console.log("UserRightsModal saveRights writeId", writeId)
      console.log("UserRightsModal saveRights checked", document.getElementById(writeId).checked)
      if (document.getElementById(writeId).checked) {
        cRights += WRITEFLAG
      }
      if (r.value != cRights) {
        console.log("UserRightsModal saveRights must patch")
        let rightsEntity = new ProjectsRights({})
        let prId = r.id.split(":")[0]
        rightsEntity.setId(prId)
        rightsEntity.setData("rights", cRights)
        rightsEntity.patch()
      } else {
        console.log("UserRightsModal saveRights unchanged")
      }
    })
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
      document.getElementById(`rightsModal`).close()
    }
    //let dialog = document.getElementById(`projectsRightsModal`)
    saveRightsButton.addEventListener('click', saveRightsFn, { once: false });
    return (saveRightsButton)
  }

  //--------------------------------------------------------------
  async buildProjectsSelectBox() {
    let projects = await Project.getAll('projects', {})
    let boxName = "kanbearProjectsRightsSelectBox"
    let buttons = [buildAddProjectsRightsButton(boxName, this.userId)]
    let checkboxes = []
    let boxParams = {
      domId: boxName,
      boxLabel: "ProjectsRights",
      buttons: buttons,
      checkboxes: checkboxes,
      items: projects,
      labelText: "ProjectsRights",
      klass: "filter-group",
    }
    let prDiv = await selectBoxBuilder(boxParams)
    console.log("UserRightsModal <buildProjectsSelectBox()>", prDiv)
    return (prDiv)
  }

  //--------------------------------------------------------------
  async buildWorkspacesSelectBox() {
    let workspaces = await Workspace.getAll('workspaces', {})
    let boxName = "kanbearWorkspacesRightsSelectBox"
    let buttons = [buildAddWorkspacesRightsButton(boxName, this.userId)]
    let checkboxes = []
    let boxParams = {
      domId: boxName,
      boxLabel: "WorkspacesRights",
      buttons: buttons,
      checkboxes: checkboxes,
      items: workspaces,
      labelText: "WorkspacesRights",
      klass: "filter-group",
    }
    let wsDiv = await selectBoxBuilder(boxParams)
    console.log("UserRightsModal <buildProjectsSelectBox()>", wsDiv)
    return (wsDiv)
  }

  //------------------------------------------------------------------------
  getItemId(kind, action, id) {
    return (`${kind}:rights:${action}:${id}`)
  }

  //------------------------------------------------------------------------
  async createTable(kind, rightsList) {
    const lkinds = kind[0].toLowerCase() + kind.slice(1)
    const lkind = lkinds.slice(0, -1)

    console.log("projectsRightsDialog.filltable()", "<rightsList>", rightsList)
    let table = document.createElement('table')
    const thead = document.createElement('thead')
    const hrow = document.createElement('tr')
    hrow.innerHTML = `
        <th>RightsId</th>
        <th>Kind</th>
        <th>${kind}Id</th>
        <th>${kind}Name</th>
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
      console.log("KanbearprojectsRightsPanel.createTable() <Rights>", rights)
      const row = document.createElement('tr');

      let kId = rights[`${lkind}_id`]
      let rightId = `${rights.id}:${kId}:${rights.user_id}`
      let hiddenRights = `<input type="hidden" class="hiddenProjectsRights" id="${rightId}" value="${rights.rights}">`
      row.appendChild(td(`${rights.id} ${hiddenRights}`))
      row.appendChild(td(kind))
      row.appendChild(td(rights[`${lkind}_id`]))
      row.appendChild(td(rights[`${lkind}_name`]))
      let referenceChecked = ((rights.rights & REFERENCEFLAG) > 0) ? "checked" : ""
      let readChecked = ((rights.rights & READFLAG) > 0) ? "checked" : ""
      let writeChecked = ((rights.rights & WRITEFLAG) > 0) ? "checked" : ""
      //let readId = `projectsRights_read_${rightId}`
      let referenceId = this.getItemId(lkinds, 'reference', rightId)
      row.appendChild(td(`<input class="userRightsCheckbox"
         type="checkbox"
         name="${rights.rights}"
         id="${referenceId}"
         ${readChecked}/>`))
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

export { UserRightsModal }
