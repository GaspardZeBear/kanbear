import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'
import { ProjectsRights } from './ProjectsRights.mjs'
import { Project } from './Project.mjs'
//import { UserRightsDialog } from './UserRightsDialog.mjs'
import { sendEvent } from '../utils/sendEvent.mjs'
import { formatDuration, dateToString, getDurationFromNow } from "../utils/dateAndTime.mjs";
import { selectBoxBuilder } from '../utils/selectBoxBuilder.mjs';
import { buildAddProjectsRightsButton } from '../utils/buttonBuilder.mjs'

// Rights flags
const READFLAG=2
const WRITEFLAG=1

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
  }

  //-----------------------------------------------------------------
  async renderProjects() {
    let projectsDiv = document.createElement("div")
    let titleprojectsRights = document.createElement('span')
    titleprojectsRights.innerHTML = `Projects rights list for user <b>${this.userName}</b> filtered by .....`
    projectsDiv.replaceChildren(titleprojectsRights)


    let projectsSelectBox = await this.buildProjectsSelectBox()
    projectsDiv.appendChild(projectsSelectBox)


    //projectsDiv.appendChild(addprojectsRightsButton)

    let projectsTable = await this.createProjectsTable()
    projectsDiv.appendChild(projectsTable)
    return (projectsDiv)
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
    rights.forEach( (r) => {
      console.log("UserRightsModal saveRights", r.id, r.value)
      let readId = this.getItemId('projects','read',r.id)
      console.log("UserRightsModal saveRights readId",readId)
      console.log("UserRightsModal saveRights checked",document.getElementById(readId).checked)
      let cRights=0
      if ( document.getElementById(readId).checked ) {
          cRights += READFLAG
      }
      let writeId = this.getItemId('projects','write',r.id)
      console.log("UserRightsModal saveRights writeId",writeId)
      console.log("UserRightsModal saveRights checked",document.getElementById(writeId).checked)
      if ( document.getElementById(writeId).checked ) {
          cRights += WRITEFLAG
      }
      if ( r.value != cRights) {
        console.log("UserRightsModal saveRights must patch")
        let rightsEntity=new ProjectsRights({})
        let prId=r.id.split(":")[0]
        rightsEntity.setId(prId)
        rightsEntity.setData("rights",cRights)
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

    //document.getElementById(boxName).addEventListener('change', async (e) => {
    /*
  prDiv.addEventListener('change', async (e) => {
          console.log("UserRightsModal buildProjectsSelectBox()", e.detail)
          let projectId = e.target.value;
          //Kontext.setProject(e.target.value);
          //let projectLink=buildProjectLink(projectId,"xxx")
          //document.getElementById("project").replaceChildren(projectLink)
          sendEvent("projectsRightsCreated", { projectId: projectId })
      });
      */


    console.log("UserRightsModal <buildProjectsSelectBox()>", prDiv)
    return (prDiv)
  }

  //------------------------------------------------------------------------
  getItemId(kind,action,id) {
    return(`${kind}Rights_${action}_${id}`)
  }

  //------------------------------------------------------------------------
  async createProjectsTable() {
    const projectsRightsEntity = new ProjectsRights({ userId: this.userId })
    let projectsRights = await projectsRightsEntity.getByUserId()
    console.log("projectsRightsDialog.filltable()", "<projectsRights>", projectsRights)
    let table = document.createElement('table')
    const thead = document.createElement('thead')
    const hrow = document.createElement('tr')
    hrow.innerHTML = `
        <th>RightsId</th>
        <th>Kind</th>
        <th>Projectid</th>
        <th>Name</th>
        <th>Rights</th>
        <th>Read_checked</th>
        <th>Write_checked</th>
        <th>Read_AND</th>
        <th>Write_AND</th>
        <th>Read</th>
        <th>Write</th>
      `

      hrow.innerHTML = `
        <th>RightsId</th>
        <th>Kind</th>
        <th>ProjectId</th>
        <th>ProjectName</th>
        <th>Read</th>
        <th>Write</th>
      `
    thead.appendChild(hrow)
    table.appendChild(thead)
    const tbody = document.createElement('tbody')

    Object.entries(projectsRights).forEach((projectsRightsEntity) => {
      const projectsRights = projectsRightsEntity[1]
      console.log("KanbearprojectsRightsPanel.createTable() <projectsRights>", projectsRights)
      const row = document.createElement('tr');

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

      let rightId = `${projectsRights.id}:${projectsRights.project_id}_${projectsRights.user_id}`
      let hiddenRights = `<input type="hidden" class="hiddenProjectsRights" id="${rightId}" value="${projectsRights.rights}">`
      row.appendChild(td(`${projectsRights.id} ${hiddenRights}`))
      row.appendChild(td("Project"))
      
      //row.appendChild(td('<input class="userRightsCheckbox" userRightsId=' + projectsRights.id + ' type="checkbox"/>'))
      //row.appendChild(tdHref(buildUserRightsLink(userRights.id, userRights.name)))
      row.appendChild(td(projectsRights.project_id))
      row.appendChild(td(projectsRights.project_name))
      
      console.log("UserRightsModal hiddenRights", hiddenRights)
      //row.appendChild(td(`${projectsRights.rights} ${hiddenRights}`))
      //row.appendChild(td(`${hiddenRights}`))
      //row.appendChild(td(projectsRights.user_id))
      let readChecked = ( (projectsRights.rights & READFLAG) > 0) ? "checked" : ""
      let writeChecked = ( (projectsRights.rights & WRITEFLAG) > 0) ? "checked" : ""
      //row.appendChild(td(readChecked))
      //row.appendChild(td(writeChecked))
      //row.appendChild(td(projectsRights.rights & READFLAG))
      //row.appendChild(td(projectsRights.rights & WRITEFLAG))

      //let readId = `projectsRights_read_${rightId}`
      let readId = this.getItemId('projects','read',rightId)
      row.appendChild(td(`<input class="userRightsCheckbox"
         type="checkbox"
         name="${projectsRights.rights}"
         id="${readId}"
         ${readChecked}/>`))
      //let writeId = `projectsRights_write_${rightId}`
      let writeId = this.getItemId('projects','write',rightId)
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
