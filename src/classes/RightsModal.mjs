import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'
import { ProjectsRights } from './ProjectsRights.mjs'
import { Project } from './Project.mjs'
import { Rights } from './Rights.mjs'
import { Workspace } from './Workspace.mjs'
import { User } from './User.mjs'
//import { UserRightsDialog } from './UserRightsDialog.mjs'
import { sendEvent } from '../utils/sendEvent.mjs'
import { formatDuration, dateToString, getDurationFromNow } from "../utils/dateAndTime.mjs";
import { selectBoxBuilder } from '../utils/selectBoxBuilder.mjs';
//import { buildAddProjectsRightsButton, buildAddWorkspacesRightsButton } from '../utils/buttonBuilder.mjs'
import { buildAddRightsButton } from '../utils/buttonBuilder.mjs'
import { createElement, buildKanbearProjectsSelectBox, buildWorkspacesSelectBox } from '../utils/createHtml.mjs';


// Rights flags
const REFERENCEFLAG = 4
const READFLAG = 2
const WRITEFLAG = 1
const DELETEFLAG = 8
const ISADMINFLAG = 16

class RightsModal {

  //------------------------------------------------------------------------
  constructor() {
    this.dialog = document.getElementById(`rightsModal`)
    //document.getElementById(`taskCommentsDialogTitle`).innerHTML="www"
    this.dialog.showModal();
    this.htmlElement = `rightsModalResults`
    this.createListeners(this)
    this.render()
  }

  //-------------------------------------------------------------------------
  async render() {
    this.rights = await Rights.getAll('rights')
    await this.loadWorkspaces()
    await this.loadProjects()
    await this.loadUsers()
    let workspaceDiv = await this.buildWorkspaceSelectBox()
    let userDiv = await this.buildUserSelectBox()
    let createRightsButton = createElement("Button", {
      textContent: "+R",
      onclick: [() => { alert(`add ${this.targetKind} ${this.targetId} ${this.ownerId}`) }]
    })
    let filterRightsButton = createElement("Button", {
      textContent: "+F",
      onclick: [() => { alert(`filter ${this.targetKind} ${this.targetId} `) }]
    })
    //await this.buildRightsTree()
    //await this.renderTree()
    //rights, users, groups, workspaces, projects) {
    let rightsTree = await this.buildRightsTreeMistral(this.rights, this.users, [], this.workspaces, this.projects)
    let tree =await this.renderTreeMistral(rightsTree)
    console.log("tree",rightsTree)
       
    document.getElementById(this.htmlElement).replaceChildren(createElement("div", {
      style: "display : flex ;",
      children: [workspaceDiv, userDiv, filterRightsButton, createRightsButton]
    }))
    document.getElementById(this.htmlElement).appendChild(tree)

  }


  //-------------------------------------------------------------------------
  async loadWorkspaces() {
    this.workspaces = await Workspace.getAll('workspaces')
    this.workspacesHash = {}
    this.workspaces.forEach((w) => {
      this.workspacesHash[w.id] = w
    })
  }
  //-------------------------------------------------------------------------

  async loadProjects() {
    this.projects = await Project.getAll('projects')
    this.projectsHash = {}
    this.projects.forEach((w) => {
      this.projectsHash[w.id] = w
    })
  }

  //-------------------------------------------------------------------------

  async loadUsers() {
    this.users = await Project.getAll('users')
    this.usersHash = {}
    this.users.forEach((u) => {
      this.usersHash[u.id] = u
    })
  }


  //-------------------------------------------------------------------------
  async buildRightsTreeMistral(rights, users, groups, workspaces, projects) {
    const usersById = new Map(users.map(u => [u.id, u]));
    const groupsById = new Map(groups.map(g => [g.id, g]));

    const ownerRef = (type, id) => {
      const row = (type === 'user' ? usersById : groupsById).get(id);
      return { id, name: row ? row.name : `#${type}:${id}` };
    };

    // 1. Noeuds workspaces, chacun avec ses projets
    const workspaceNodes = new Map();
    for (const w of workspaces) {
      workspaceNodes.set(w.id, {
        id: w.id,
        name: w.name,
        users: [],
        groups: [],
        projects: new Map(projects
          .filter(p => p.workspace_id === w.id)
          .map(p => [p.id, { id: p.id, name: p.name, users: [], groups: [] }])
        ),
      });
    }

    // 2. index target_id → node pour ranger les droits en O(1)
    const targetIndex = new Map(); // "kind:id" → node
    for (const w of workspaceNodes.values()) {
      targetIndex.set(`workspace:${w.id}`, w);
      for (const p of w.projects.values()) targetIndex.set(`project:${p.id}`, p);
    }

    // 3. Répartition des droits
    for (const r of rights) {
      const node = targetIndex.get(`${r.target_kind}:${r.target_id}`);
      if (!node) continue; // cible inconnue/supprimée → ligne ignorée (ou logger)

      const list = r.owner_type === 'user' ? node.users : node.groups;
      list.push({ ...ownerRef(r.owner_type, r.owner_id), rights: r.rights });
    }

    // 4. Map → Array
    return [...workspaceNodes.values()].map(w => ({
      ...w,
      projects: [...w.projects.values()],
    }));
  }

  //---------------------------------------------------------------------------------
  /*
  [
  {
    id: 101, name: "Workspace Kanbear",
    users:  [ { id: 1, name: "Gaspard", rights: 18 } ],
    groups: [ { id: 10, name: "Équipe Design", rights: 2 } ],
    projects: [
      {
        id: 201, name: "Site vitrine",
        users:  [ { id: 1, name: "Gaspard", rights: 2 } ],
        groups: [ { id: 11, name: "Dev Backend", rights: 18 } ],
      },
      // ... autres projets sans droits : présents, listes vides
    ],
  },
  // ...
]
  */
  async renderTreeMistral(tree) {
    let content= tree.map(w => `
    <div class="workspace">
      <h2>🗂 ${w.name}</h2>
      <div>👤 ${w.users.map(u => `${u.name} (${u.rights})`).join(', ') || '—'}</div>
      <div>👥 ${w.groups.map(g => `${g.name} (${g.rights})`).join(', ') || '—'}</div>
      ${w.projects.map(p => `
        <div class="project">
          <h3>📁 ${p.name}</h3>
          <div>👤 ${p.users.map(u => `${u.name} (${u.rights})`).join(', ') || '—'}</div>
          <div>👥 ${p.groups.map(g => `${g.name} (${g.rights})`).join(', ') || '—'}</div>
        </div>`).join('')}
    </div>`).join('');
    return(createElement("div",{
      innerHTML:content
    }))
  }

  //-------------------------------------------------------------------------
  async buildRightsTree() {
    
    console.log("RightsModal buildRightsTree() this.rights ", this.rights)
    this.workspacesWithRights = this.rights.filter((r) => r.target_kind === 'workspace')
    this.rightsTree = {}
    for (let w of this.workspacesWithRights) {
      if (!this.rightsTree[w.target_id]) {
        this.rightsTree[w.target_id] = { id: w.id, projects: {}, users: [], groups: [] }
      }
    }

    let wsStruct = {}
    let prStruct = {}
    for (let r of this.rights) {
      console.log("RightsModal buildRightsTree() r ", r)
      switch (r.target_kind) {
        case 'workspace':
          if (!wsStruct[r.target_id]) {
            wsStruct[r.target_id] = { project: {}, user: {}, group: {} }
          }
          wsStruct[r.target_id][r.owner_type][r.id] = r
          break
        case 'project':
          if (!prStruct[r.target_id]) {
            prStruct[r.target_id] = { user: {}, group: {} }
          }
          prStruct[r.target_id][r.owner_type][r.id] = r
          let wsId = this.projectsHash[r.target_id].id
          wsStruct[wsId].project[r.target_id] = prStruct[r.target_id][r.owner_type][r.id]
          break
      }
    }



    console.log("RightsModal buildRightsTree() wsStruct ", wsStruct, prStruct)
    /*
    this.projectsWithRights = this.rights.filter((r) => r.target_kind === 'project')
    console.log("RightsModal buildRightsTree() this.projectsWithRights ", this.projectsWithRights)
    for (let p of this.projectsWithRights) {
      let wsId = this.projectsHash[p.target_id]["workspace_id"]
      console.log("RightsModal buildRightsTree() wsId ", wsId, this.rightsTree[wsId])
      this.rightsTree[wsId]["projects"].push(p)
    }
    
    for (let r of this.rights) {
      console.log("RightsModal buildRightsTree() r ", r)
      switch (r.target_kind) {
        case 'workspace':
          this.rightsTree[r.target_id][`${r.owner_type}s`].push(r)
          break
        case 'project':
          // find l'id du workspace du project
          console.log("RightsModal buildRightsTree() this.projectsHash ", this.projectsHash)
          let wsId = this.projectsHash[r.target_id].id
          if (!this.rightsTree[wsId].projects[r.target_id]) {
            this.rightsTree[wsId].projects[r.target_id] = { id: r.target_id, users: [], groups: [] }
          }

          this.rightsTree[wsId].projects.push(r)
          break
        default:
          break
      }
    }
      */
    this.rightsTree = wsStruct

    console.log("RightsModal buildRightsTree() this.rightsTree ", this.rightsTree)
  }

  //---------------------------------------------------------------------------------
  async renderTree() {
    let wsDivs = []
    Object.keys(this.rightsTree).forEach((ws) => {
      console.log("ws", ws)
      let wuDivs = []
      Object.keys(this.rightsTree[ws].user).forEach(([k, u]) => {
        console.log("u", u)
        let uDiv = createElement("div", {
          textContent: `${u.owner_type} ${u.owner_id}# ${u.target_kind} ${u.target_id}`
        })
        wuDivs.push(uDiv)
      })
      let wpDivs = []
      Object.keys(this.rightsTree[ws].project).forEach(([k, p]) => {
        console.log("p", p)
        let pDiv = createElement("div", {
          textContent: `${this.projectsHash[p].name}#${p.id}`
        })
        wpDivs.push(pDiv)
      })
      let wsDiv = createElement('div', {
        //textContent: `${this.workspacesHash[ws.target_id].name}#${ws.target_id}`,
        children: [wuDivs, wpDivs]
      })
      wsDivs.push(wsDiv)
    })


    let all = createElement("div", {
      children: wsDivs
    })

  }


  //-------------------------------------------------------------------------
  async buildWorkspaceSelectBox() {

    //wss.unshift({ id: -1, name: '* Create new workspace' })
    let addWorkspaceButton = createElement("Button", {
      textContent: "W",
      onclick: [() => { alert("click") }]
    })
    let workspaceBoxName = "rightsWorkspaceSelectBox"
    let workspaceBoxParams = {
      domId: workspaceBoxName,
      boxLabel: "workspace",
      //buttons: [addWorkspaceButton],
      items: this.workspaces,
      labelText: "Workspace",
      klass: "filter-group",
      //selectedOption: Kontext.getWorkspaceId()
      //headItems:[['* Create new workspace',-1]]
    }
    let workspaceSelectBox = await selectBoxBuilder(workspaceBoxParams)
    let myThis = this
    workspaceSelectBox.addEventListener('change', async (e) => {
      console.log("RightsModal render() workspace ", e.target.value)
      myThis.targetId = e.target.value
      myThis.targetKind = 'workspace'
    });
    return (workspaceSelectBox)
  }

  //-------------------------------------------------------------------------
  async buildProjectSelectBox() {

    //wss.unshift({ id: -1, name: '* Create new workspace' })
    let addWorkspaceButton = createElement("Button", {
      textContent: "W",
      onclick: [() => { alert("click") }]
    })
    let projectBoxName = "rightsWorkspaceSelectBox"
    let projectBoxParams = {
      domId: projectBoxName,
      boxLabel: "project",
      //buttons: [addWorkspaceButton],
      items: this.projects,
      labelText: "project",
      klass: "filter-group",
      //selectedOption: Kontext.getWorkspaceId()
      //headItems:[['* Create new workspace',-1]]
    }
    let projectSelectBox = await selectBoxBuilder(projectBoxParams)
    let myThis = this
    projectSelectBox.addEventListener('change', async (e) => {
      console.log("RightsModal render() workspace ", e.target.value)
      myThis.targetId = e.target.value
      myThis.targetKind = 'project'
    });
    return (projectSelectBox)
  }

  //-------------------------------------------------------------------------
  async buildUserSelectBox() {
    this.users = await User.getAll('users')
    let addUserButton = createElement("Button", {
      textContent: "U",
      onclick: [() => { alert("click") }]
    })
    let userBoxName = "rightsUserSelectBox"
    let userBoxParams = {
      domId: userBoxName,
      boxLabel: "user",
      //buttons: [addUserButton],
      items: this.users,
      labelText: "User",
      klass: "filter-group",
      //selectedOption: Kontext.getWorkspaceId()
      //headItems:[['* Create new workspace',-1]]
    }
    let userSelectBox = await selectBoxBuilder(userBoxParams)
    let myThis = this
    userSelectBox.addEventListener('change', async (e) => {
      console.log("RightsModal render() user ", e.target.value)
      myThis.ownerId = e.target.value
      myThis.ownerType = 'user'
    });
    return (userSelectBox)

  }

  //-----------------------------------------------------------------
  async Xrender() {
    console.log("RightsModal render() fired")
    const result = document.getElementById(this.htmlElement);
    //document.getElementById(this.htmlElement).innerHTML = `<h2>${this.project.name} filtered by ...</h2>`

    let resultTitleRights = document.createElement('h3')
    let exitRightsButton = this.buildExitRightsButton()
    resultTitleRights.appendChild(exitRightsButton)
    let saveRightsButton = this.buildSaveRightsButton()
    resultTitleRights.appendChild(saveRightsButton)
    result.replaceChildren(resultTitleRights)
    console.log("RightsModal render() collecting workspaces")
    this.workspaces = await Workspace.getAll('workspaces', {})
    this.workspacesHash = {}
    this.workspaces.forEach((w) => {
      this.workspacesHash[w.id] = w
    })
    console.log("RightsModal render() workspaces collected")
    console.log("RightsModal render() collecting projects")
    this.projects = await Project.getAll('projects', {})
    console.log("RightsModal render() projects collected")
    this.projectsHash = {}
    this.projects.forEach((p) => {
      this.projectsHash[p.id] = p
    })
    console.log("RightsModal render() rendering workspaces")
    result.appendChild(await this.renderWorkspaces())
    console.log("RightsModal render() workspaces  rendered")

    console.log("RightsModal render() rendering projects")
    result.appendChild(await this.renderProjects())
    console.log("RightsModal render() projects rendered")
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
    }, false)]
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
    }, false)]
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

  //--------------------------------------------------------------------------------
  getFullProjectName(projectId) {
    let wsName
    try {
      wsName = this.workspacesHash[this.projectsHash[projectId].workspace_id].name ?? "unknown wsName"
    } catch (error) {
      console.log("RightsModal hash ", this.workspacesHash, " target ", rights.target_id)
    }
    return (`${wsName}/${this.projectsHash[projectId].name}/${this.projectsHash[projectId].workspace_id}`)
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
          /*
          let wsName
          try {
            wsName = this.workspacesHash[this.projectsHash[rights.target_id].workspace_id].name ?? "unknown wsName"
          } catch (error) {
            console.log("RightsModal hash ", this.workspacesHash, " target ", rights.target_id)
          }
          let fqn = `${wsName}/${rights.target_name}/${this.projectsHash[rights.target_id].workspace_id}`
          */
          row.appendChild(td(this.getFullProjectName(rights.target_id)))
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
