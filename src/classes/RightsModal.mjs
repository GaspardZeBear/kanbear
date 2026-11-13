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
    //this.render()
  }

  //-------------------------------------------------------------------------
  async render() {
    await this.loadRights()
    await this.loadWorkspaces()
    await this.loadProjects()
    await this.loadUsers()
    await this.buildHavingRightsThings()
    console.log("render() workspaces", this.workspaces, "righted workspaces", this.havingRightsWorkspaces)
    let workspaceDiv = await this.buildWorkspaceSelectBox()
    let addRightsButton = buildAddRightsButton(
      `addWorkspacesRights`,
      this.getAddRightsFn({
          action: "addWorkspace"
        }
      ),
      false)

    let filterRightsButton = createElement("Button", {
      textContent: "+F",
      onclick: [() => { alert(`filter ${this.targetKind} ${this.targetId} `) }]
    })
    let saveRightsButton = this.buildSaveRightsButton()
    let exitRightsButton = this.buildExitRightsButton()
    let rightsTree = this.buildRightsTree(this.rights,
      this.users, [],
      this.havingRightsWorkspaces,
      this.havingRightsProjects
    )
    console.log("render() rightsTree", rightsTree)
        let treeAsTable = await this.renderTree(rightsTree)
    //console.log("tree", tree)

    document.getElementById(this.htmlElement).replaceChildren(createElement("div", {
      style: "display : flex ;position: sticky; top: 0; z-index: 1000;margin-bottom : 10px;background-color: lightgrey;",
      children: [workspaceDiv,
        //userDiv,
        filterRightsButton,
        //createRightsButton,
        addRightsButton,
        exitRightsButton,
        saveRightsButton
      ]
    }))
    document.getElementById(this.htmlElement).appendChild(treeAsTable)
  }

  //-------------------------------------------------------------------------
  async loadWorkspaces() {
    this.workspaces = await Workspace.getAll('workspaces')
    console.log("RightsModal loadWorkspaces", this.workspaces)
    this.workspaces.sort((a, b) => a.name.localeCompare(b.name))
    console.log("RightsModal loadWorkspaces sorted", this.workspaces)
    this.workspacesHash = {}
    this.workspaces.forEach((w) => {
      this.workspacesHash[w.id] = w
    })
  }

  //-------------------------------------------------------------------------
  async loadProjects() {
    this.projects = await Project.getAll('projects')
    this.projects.sort()
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
  async loadRights() {
    this.rights = await Rights.getAll('rights')
    this.rightsHash = {}
    this.rights.forEach((r) => {
      this.rightsHash[r.id] = r
    })
  }

  //-------------------------------------------------------------------------
  async buildHavingRightsThings() {
    let havingRightsWorkspaces = new Set()
    let havingRightsProjects = new Set()
    //console.log("RightsModal buildHavingRightsThings r")
    this.rights.forEach((r) => {
      //console.log("RightsModal buildHavingRightsThings r", r)
      switch (r.target_kind) {
        case 'workspace':
          //console.log("RightsModal buildHavingRightsThings workspace r", r)
          if (this.workspacesHash[r.target_id]) {
            havingRightsWorkspaces.add(this.workspacesHash[r.target_id].id)
          }
          break
        case 'project':
          //console.log("RightsModal buildHavingRightsThings project r", r)
          if (this.projectsHash[r.target_id]) {
            havingRightsProjects.add(this.projectsHash[r.target_id].id)
          }
          break
      }
    })
    //console.log("RightsModal buildHavingRightsThings havingRightsWorkspaces", havingRightsWorkspaces)
    //console.log("RightsModal buildHavingRightsThings havingRightsProjects", havingRightsProjects)
    this.havingRightsWorkspaces = []
    for (let wId of havingRightsWorkspaces) {
      this.havingRightsWorkspaces.push(this.workspacesHash[wId])
    }
    this.havingRightsProjects = []
    for (let pId of havingRightsProjects) {
      this.havingRightsProjects.push(this.projectsHash[pId])
    }
    this.havingRightsWorkspaces.sort((a, b) => a.name.localeCompare(b.name))
    this.havingRightsProjects.sort((a, b) => a.name.localeCompare(b.name))
  }


  //-------------------------------------------------------------------------
  buildRightsTree(rights, users, groups, workspaces, projects) {
    console.log("buildRightsTree() workspaces", workspaces)
    console.log("buildRightsTree() projects", projects)
    const usersById = new Map(users.map(u => [u.id, u]));
    const groupsById = new Map(groups.map(g => [g.id, g]));

    const ownerRef = (type, id) => {
      const row = (type === 'user' ? usersById : groupsById).get(id);
      return { id, name: row ? row.name : `#${type}:${id}` };
    };

    const createKindMap = (rights, kind) => new Map(
      rights
        .filter(r => !r.owner_type && r.target_id > 0 && r.target_kind === kind)
        .map(r => [r.target_id, r])
    );
    const workspacesRightIdsMap = createKindMap(rights, 'workspace');
    const projectsRightIdsMap = createKindMap(rights, 'project');

    console.log("buildRightsTree() workspacesRightIdsMap", workspacesRightIdsMap)
    console.log("buildRightsTree() projectsRightIdsMap", projectsRightIdsMap)

    // 1. Noeuds workspaces, chacun avec ses projets
    const workspaceNodes = new Map();
    for (const w of workspaces) {
      console.log("buildRightsTree() w", w, "w.id", w.id, workspacesRightIdsMap.get(w.id) ?? "not found")
      workspaceNodes.set(w.id, {
        id: w.id,
        name: w.name,
        rightsId: workspacesRightIdsMap.get(w.id).id,
        users: [],
        groups: [],
        projects: new Map(projects
          .filter(p => p.workspace_id === w.id)
          .map(p => [p.id, { id: p.id, name: p.name, rightsId: projectsRightIdsMap.get(p.id).id, users: [], groups: [] }])
        ),
      });
    }
        // 2. index target_id → node pour ranger les droits en O(1)
    const targetIndex = new Map(); // "kind:id" → node
    for (const w of workspaceNodes.values()) {
      targetIndex.set(`workspace:${w.id}`, w);
      for (const p of w.projects.values()) {
        targetIndex.set(`project:${p.id}`, p);
      }
    }
    
    for (const r of rights) {
      const key = `${r.target_kind}:${r.target_id}`
      const node = targetIndex.get(key);
      if (!node) continue; // cible inconnue/supprimée → ligne ignorée (ou logger)
      const list = r.owner_type === 'user' ? node.users : node.groups;
      list.push({ ...ownerRef(r.owner_type, r.owner_id), rightsId: r.id });
    }

    // 4. Map → Array
    let tree = [...workspaceNodes.values()].map(w => ({
      ...w,
      projects: [...w.projects.values()],
    }));
    return (tree)
  }

  //---------------------------------------------------------------------------------
  /*
  [
  {
    id: 101, name: "Workspace Kanbear", rightsId: 13,
    users:  [ { id: 1, name: "Gaspard", rightsId: 1 } ],
    groups: [ { id: 10, name: "Équipe Design", rightsId: 2 } ],
    projects: [
      {
        id: 201, name: "Site vitrine", rightsId: 45
        users:  [ { id: 1, name: "Gaspard", rightsId: 3 } ],
        groups: [ { id: 11, name: "Dev Backend", rightsId: 4 } ],
      },
      // ... autres projets sans droits : présents, listes vides
    ],
  },
  // ...
]
  */

  //-----------------------------------------------------------------------------------------
  getTargetId() {
    return (this.targetId)
  }

  //-----------------------------------------------------------------------------------------------
  getAddRightsFn(params) {
    let myThis = this
    let addRightsFn = function (ev) {

      // trick to get values at time of firing the function, not creating it
      let getThis = () => { console.log("getThis fired", myThis); return (myThis) }
      /*console.log("addRightsButton event Listener fired",
        "params", params,
        "target_id", getThis().targetId,
        "target_id() ", getThis().targetId,
        "target_kind", getThis().targetKind,
        "owner_id", getThis().ownerId,
        "owner_type", getThis().ownerType)
        */
      //let el = document.getElementById(`kanbear${params.targetKind}RightsSelectBox`)
      //console.log("addRightsButton event Listener fired, selected", el.value)
      ev.stopPropagation();
      //let targetId = parseInt(document.getElementById(boxId).value)
      //if (rightsModal.targetId && rightsModal.targetId > 0) {
      const rights = new Rights({})
      console.log("addRightsButton event Listener fired", "params", params)
      let doIt = true
      let kind
      switch (params.action) {
        case "addWorkspace":
          kind = 'workspace'
          if (getThis().targetId < 1) { doIt = false }
          rights.setData("target_id", getThis().targetId)
          rights.setData("target_kind", kind)
          break
        case "addProjectToWorkspace":
          kind = 'project'
          if (getThis().targetId < 1) { doIt = false }
          rights.setData("target_id", getThis().targetId)
          rights.setData("target_kind", kind)
          break
        case "addUserToWorkspace":
          kind = 'workspace'
          if (getThis().ownerId < 1 || params.workspaceId < 1) { doIt = false }
          rights.setData("owner_id", getThis().ownerId)
          getThis().ownerId = -99
          rights.setData("owner_type", 'user')
          rights.setData("target_id", params.workspaceId)
          rights.setData("target_kind", kind)
          break
        case "addUserToProject":
          kind = 'project'
          if (getThis().ownerId < 1 || params.workspaceId < 1) { doIt = false }
          rights.setData("owner_id", getThis().ownerId)
          getThis().ownerId = -99
          rights.setData("owner_type", 'user')
          rights.setData("target_id", params.projectId)
          rights.setData("target_kind", kind)
          break
        default:
          doIt = false
          console.log("addRightsButton event Listener unknown action", params.action)
          break
      }
      if (doIt) {
        rights.create()
          .finally(() => {
            console.log("rightsUserSelectBox", document.getElementsByClassName("rightsUserSelectBox"))
            for (let s of document.getElementsByClassName("rightsUserSelectBox")) {
              s.selectedIndex = -1
            }
            sendEvent(`${kind}sRightsCreated`, {})
          })

      }
    }
    return (addRightsFn)
  }

  //--------------------------------------------------------------------------------------------------------------
  async renderProjectsInWorkspace(divs, w) {
    console.log("renderProjectsInWorkspace(w)", w)
    for (let p of w.projects) {
      console.log("renderProjectsInWorkspace(w) project ", p)
      let userSelectBox = await this.buildUserSelectBox()
      let addUserRightsButton = buildAddRightsButton(
        `addUserRightsToProject-${p.id}`,
        this.getAddRightsFn({
          action: "addUserToProject",
          projectId: p.id
        }),
        false)
      let delRightButton = this.buildDelRightButton(p.rightsId,
        (!(p.users.length === 0 ) )
        )
      divs.push(createElement('div', {
        //style: "display:flex;",
        class: "rights-item right-level-1 right-project",
        children: [
          delRightButton,
          createElement('div', {
            textContent: `${p.rightsId} Project ${p.name}#${p.id}`,
          }),
          userSelectBox,
          addUserRightsButton
        ]
      }))
      this.buidRightsTable(divs, "rights-base right-level-2 right-actor", p.groups, p.users)
    }
  }

  //------------------------------------------------------------------------------------------------------------------
  async renderWorkspaceHeader(divs, w) {
    console.log("renderWorkspaceHeader(w)", w)
    let wsProjects = this.projects.filter((p) => { return p.workspace_id === w.id })

    let projectsSelectBox = await this.buildProjectsSelectBox(wsProjects)
    let addProjectRightsButton = buildAddRightsButton(
      `addProjectRightsToWorkspace-${w.id}`,
      this.getAddRightsFn({
        action: "addProjectToWorkspace",
        workspaceId: w.id
      }),

      false)
    let userSelectBox = await this.buildUserSelectBox()
    let addUserRightsButton = buildAddRightsButton(
      `addUserRightsToWorkspace-${w.id}`,
      this.getAddRightsFn({
        action: "addUserToWorkspace",
        workspaceId: w.id
      }),
      false)
    let delRightButton = this.buildDelRightButton(w.rightsId,
      //( ! (w.users.length === 0 && w.groups.length === 0 && w.projects.length === 0) )
      (!(w.users.length === 0 && w.projects.length === 0))
      //false
    )
    let wDiv = createElement('div', {
      class: "rights-base right-level-0",
      //style: "background-color : pink;display:flex;",
      children: [
        delRightButton,
        createElement('div', {
          textContent: `${w.rightsId} Workspace ${w.name}#${w.id}`,
        }),
        projectsSelectBox,
        addProjectRightsButton,
        userSelectBox,
        addUserRightsButton]
    })
    divs.push(wDiv)
    console.log("renderWorkspaceHeader(w)", w, "wDiv", wDiv)
  }

  //--------------------------------------------------------------------------------------------------------
  async renderTree(tree) {
    this.wDiv = []
    for (let w of tree) {
      await this.renderWorkspaceHeader(this.wDiv, w)
      this.buidRightsTable(this.wDiv, "rights-base right-level-1 right-actor", w.groups, w.users)
      await this.renderProjectsInWorkspace(this.wDiv, w)
    }

    return (createElement("div", {
      class: "tree-flex",
      //children: wDivs
      children: this.wDiv
    }))
  }

  //----------------------------------------------------------------------------------------------------------
  buidRightsTableHead() {
    const thead = createElement('thead', {
      children: [
        createElement('tr', {
          children: [
            createElement('th', {}),
            createElement('th', {}),
            createElement('th', { innerHTML: 'RightsId' }),
            createElement('th', { innerHTML: 'isAdmin' }),
            createElement('th', { innerHTML: 'Delete' }),
            createElement('th', { innerHTML: 'Reference' }),
            createElement('th', { innerHTML: 'Read' }),
            createElement('th', { innerHTML: 'Write' }),
          ]
        })
      ]
    })
    return (thead)
  }

  //------------------------------------------------------------------------
  //users:  [ { id: 1, name: "Gaspard", rightsId: 1 } ],
  //  groups: [ { id: 10, name: "Équipe Design", rightsId: 2 } ],
  buidRightsTable(divs, cssClass, groups, users) {
    let table = createElement('table', {
    })
    //table.appendChild(this.buidRightsTableHead())
    const tbody = document.createElement('tbody')

    const td = (p) => {
      const td = document.createElement('td')
      td.innerHTML = p
      return (td)
    }
    const tdElement = (p) => {
      const td = createElement('td',{
        children: [p]
      })
      return (td)
    }

    const tdHref = (href) => {
      const td = document.createElement('td')
      td.appendChild(href)
      return (td)
    }

    //Object.entries(projectsRightsList).forEach((projectsRightsEntity) => {
    users.forEach((user) => {
      //console.log("UserRightsModal.buildRightsTable() tr ", "user", user)
      const row = document.createElement('tr');
      let rightsId = `${user.rightsId}`
      let radix = `rights:${rightsId}`
      let rights = this.rightsHash[rightsId]
      let delRightButton = this.buildDelRightButton(rightsId,false)
      row.appendChild(tdElement(delRightButton))
      let hiddenRights = `<input type="hidden" class="hiddenRights" id="${radix}" value="${rights.rights}">`
      row.appendChild(td(`${rightsId} ${hiddenRights}`))
      row.appendChild(td(`user ${user.name}#${user.id}`))
      row.appendChild(td(`${rights.target_kind}#${rights.target_id} : ${rights.rights}`))
      let isadminChecked = ((rights.rights & ISADMINFLAG) > 0) ? "checked" : ""
      let deleteChecked = ((rights.rights & DELETEFLAG) > 0) ? "checked" : ""
      let referenceChecked = ((rights.rights & REFERENCEFLAG) > 0) ? "checked" : ""
      let readChecked = ((rights.rights & READFLAG) > 0) ? "checked" : ""
      let writeChecked = ((rights.rights & WRITEFLAG) > 0) ? "checked" : ""
      //let readId = `projectsRights_read_${rightId}`
      let isadminId = this.getItemId(radix, 'isadmin', rightsId)
      row.appendChild(td(`isAdmin <input class="userRightsCheckbox"
         type="checkbox"
         name="${rights.rights}"
         id="${isadminId}"
         ${isadminChecked}/>`))
      let deleteId = this.getItemId(radix, 'delete', rightsId)
      row.appendChild(td(`delete <input class="userRightsCheckbox"
         type="checkbox"
         name="${rights.rights}"
         id="${deleteId}"
         ${deleteChecked}/>`))
      let referenceId = this.getItemId(radix, 'reference', rightsId)
      row.appendChild(td(`reference <input class="userRightsCheckbox"
         type="checkbox"
         name="${rights.rights}"
         id="${referenceId}"
         ${referenceChecked}/>`))
      let readId = this.getItemId(radix, 'read', rightsId)
      row.appendChild(td(`read <input class="userRightsCheckbox"
         type="checkbox"
         name="${rights.rights}"
         id="${readId}"
         ${readChecked}/>`))
      //let writeId = `projectsRights_write_${rightId}`
      let writeId = this.getItemId(radix, 'write', rightsId)
      row.appendChild(td(`write <input class="userRightsCheckbox" 
         type="checkbox"
         id="${writeId}"
         ${writeChecked}/>`))

      tbody.appendChild(row);
    }
    );
    table.appendChild(tbody)
    divs.push(createElement('div', {
      class: cssClass,
      children: [table]
    }))
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
    console.log("RightsModal buildWorkspaceSelectBox() workspaces ", this.workspaces)
    let workspaceSelectBox = await selectBoxBuilder(workspaceBoxParams)
    let myThis = this
    workspaceSelectBox.addEventListener('change', async (e) => {
      console.log("RightsModal buildWorkspaceSelectBox() workspace ", e.target.value)
      this.targetId = e.target.value
      this.targetKind = 'workspace'
    });
    return (workspaceSelectBox)
  }

  //-------------------------------------------------------------------------
  async buildUserSelectBox() {
    //this.users = await User.getAll('users')
    let addUserButton = createElement("Button", {
      textContent: "U",
      onclick: [() => {
        alert("click")
      }]
    })
    let userBoxName = "rightsUserSelectBox"
    let userBoxParams = {
      //domId: userBoxName,
      boxLabel: "user",
      //buttons: [addUserButton],
      items: this.users,
      labelText: "User",
      klass: "filter-group rightsUserSelectBox",
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

  //-----------------------------------------------------------------------------
  async getRightsList(kind) {
    const rightsEntity = new Rights({ ownerId: this.ownerId })
    let rightsList = await rightsEntity.getByUserId()
    console.log("RightsModal this.getRightsList() ", rightsList)
    return (rightsList
      .filter((right) => right.target_kind === kind && right.owner_type === this.ownerType))
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
    document.addEventListener("rightDeleted", async (ev) => {
      console.log("RightsModal() rightDeleted listener fired <ev>", ev)
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
  buildDelRightButton(rightId, disabled) {
    const myThis = this
    let delRightFn = async function (ev) {
      console.log("delRightButton event Listener fired")
      ev.stopPropagation();
      if ( confirm(`delRightButton_${rightId}`)) {
        let rightsEntity
        rightsEntity = new Rights({})
        rightsEntity.setId(rightId)
        //rightsEntity.setData("rights", cRights)
        //rightsEntity.setData("target_type", kind)
        await rightsEntity.delete()
      }
      sendEvent("rightDeleted",{})
    }
    //let dialog = document.getElementById(`projectsRightsModal`)
    const delRightButton = createElement('button', {
      class: "add-item-btn",
      innerHTML: "X",
      id: `delRightButton_${rightId}`,
      onclick: [delRightFn, { once: true }]
    })
    if (disabled) {
      delRightButton.setAttribute("disabled", "")
    }
    return (delRightButton)
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
  async buildProjectsSelectBox(projects) {
    //let projects = await Project.getAll('projects', {})
    let boxName = "kanbearProjectsRightsSelectBox"
    let checkboxes = []
    //let projects = []
    //console.log("RightsModal buildProjectsSelectBox()", this.projects)
    //this.projects.forEach((p) => {
    //  p.name = `${this.workspacesHash[p.workspace_id].name}/${p.name}/#${p.id}`
    //  projects.push(p)
    //})
    let boxParams = {
      domId: boxName,
      boxLabel: "Projects",
      //buttons: buttons,
      checkboxes: checkboxes,
      items: projects,
      labelText: "Projects",
      klass: "filter-group",
    }
    let projectsSelectBox = await selectBoxBuilder(boxParams)
    let myThis = this
    projectsSelectBox.addEventListener('change', async (e) => {
      console.log("RightsModal render() user ", e.target.value)
      myThis.targetId = e.target.value
      myThis.targetType = 'project'
    });
    console.log("UserRightsModal <buildProjectsSelectBox()>", projectsSelectBox)
    return (projectsSelectBox)
  }

  //------------------------------------------------------------------------
  getItemId(radix, action) {
    return (`${radix}:${action}`)
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
}

export { RightsModal }
