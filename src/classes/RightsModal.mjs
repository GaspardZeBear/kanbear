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

    await this.loadRights()
    await this.loadWorkspaces()
    await this.loadProjects()
    await this.loadUsers()
    await this.buildHavingRightsThings()
    console.log("render() workspaces", this.workspaces, "righted workspaces", this.havingRightsWorkspaces)
    let workspaceDiv = await this.buildWorkspaceSelectBox()
    let userDiv = await this.buildUserSelectBox()
    let createRightsButton = createElement("Button", {
      textContent: "+R",
      onclick: [() => { alert(`add ${this.targetKind} ${this.targetId} ${this.ownerId}`) }]
    })
    let addRightsButton = buildAddRightsButton(`addWorkspacesRights}`,
      this,
      { action: "addWorkspace" },
      false)

    let filterRightsButton = createElement("Button", {
      textContent: "+F",
      onclick: [() => { alert(`filter ${this.targetKind} ${this.targetId} `) }]
    })
    let saveRightsButton = this.buildSaveRightsButton()
    let exitRightsButton = this.buildExitRightsButton()
    //await this.buildRightsTree()
    //await this.renderTree()
    //rights, users, groups, workspaces, projects) {
    let rightsTree = this.buildRightsTreeMistral(this.rights,
      this.users, [],
      this.havingRightsWorkspaces,
      this.havingRightsProjects
    )
    console.log("render() rightsTree", rightsTree)
    let tree = this.XrenderTreeMistral(rightsTree)
    let treeAsTable = await this.renderTreeMistral(rightsTree)
    //console.log("tree", tree)

    document.getElementById(this.htmlElement).replaceChildren(createElement("div", {
      style: "display : flex ;",
      children: [workspaceDiv,
        //userDiv,
        filterRightsButton,
        //createRightsButton,
        addRightsButton,
        exitRightsButton,
        saveRightsButton
      ]
    }))
    document.getElementById(this.htmlElement).appendChild(tree)
    document.getElementById(this.htmlElement).appendChild(treeAsTable)

  }


  //-------------------------------------------------------------------------
  async loadWorkspaces() {
    this.workspaces = await Workspace.getAll('workspaces')
    console.log("loadWorkspaces() workspaces", this.workspaces)
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
          console.log("RightsModal buildHavingRightsThings workspace r", r)
          havingRightsWorkspaces.add(this.workspacesHash[r.target_id].id)
          break
        case 'project':
          console.log("RightsModal buildHavingRightsThings project r", r)
          havingRightsProjects.add(this.projectsHash[r.target_id].id)
          break
      }
    })
    console.log("RightsModal buildHavingRightsThings havingRightsWorkspaces", havingRightsWorkspaces)
    console.log("RightsModal buildHavingRightsThings havingRightsProjects", havingRightsProjects)

    this.havingRightsWorkspaces = []
    for (let wId of havingRightsWorkspaces) {
      this.havingRightsWorkspaces.push(this.workspacesHash[wId])
    }
    this.havingRightsProjects = []
    for (let pId of havingRightsProjects) {
      this.havingRightsProjects.push(this.projectsHash[pId])
    }

    /*
    this.havingRightsProjects = [...havingRightsProjects]
       .filter((pId) => {
        let p=this.projects[pId]
        if (!p?.workspace_id) {
          console.log("buildHavingRightsThings() no workspace_id")
          return(false)
        }
        if ( !havingRightsWorkspaces.has(p.workspace_id)) {
          console.log("buildHavingRightsThings() workspace_id not found")
          return(false)
        }
        return(true)
       })
        */
    //      havingRightsWorkspaces.has(p.workspace_id) : false)
    //    .filter((p) => (p?.workspace_id !== undefined) ? havingRightsWorkspaces.has(p.workspace_id) : false)

  }


  //-------------------------------------------------------------------------
  buildRightsTreeMistral(rights, users, groups, workspaces, projects) {
    console.log("buildRightsTreeMistral() workspaces", workspaces)
    console.log("buildRightsTreeMistral() projects", projects)
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
    console.log("buildRightsTreeMistral() workspaceNodes", workspaceNodes)

    // 2. index target_id → node pour ranger les droits en O(1)
    const targetIndex = new Map(); // "kind:id" → node
    for (const w of workspaceNodes.values()) {
      targetIndex.set(`workspace:${w.id}`, w);
      for (const p of w.projects.values()) {
        targetIndex.set(`project:${p.id}`, p);
      }
    }
    console.log("buildRightsTreeMistral() targetIndex", targetIndex)

    for (const r of rights) {
      console.log("buildRightsTreeMistral() right", r)
      const key = `${r.target_kind}:${r.target_id}`
      const node = targetIndex.get(key);
      console.log("buildRightsTreeMistral() right", r, "key", key, "node", node)
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
    id: 101, name: "Workspace Kanbear",
    users:  [ { id: 1, name: "Gaspard", rightsId: 1 } ],
    groups: [ { id: 10, name: "Équipe Design", rightsId: 2 } ],
    projects: [
      {
        id: 201, name: "Site vitrine",
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
  XrenderTreeMistral(tree) {
    let wDivs = []
    for (let w of tree) {
      let wDiv = []
      for (let g of w.groups) {
        let gDiv = createElement('div', {
          textContent: `${g.name} ${g.rightsId}`
        })
        wDiv.push(gDiv)
      }

      for (let u of w.users) {
        let uDiv = createElement('div', {
          textContent: `${u.name} ${u.rightsId}`
        })
        wDiv.push(uDiv)
      }

      for (let p of w.projects) {
        for (let g of p.groups) {
          let gDiv = createElement('div', {
            textContent: `${p.name} ${g.name} ${g.rightsId}`
          })
          wDiv.push(gDiv)
        }

        for (let u of p.users) {
          let uDiv = createElement('div', {
            textContent: `${p.name} ${u.name} ${u.rightsId}`
          })
          wDiv.push(uDiv)
        }
        //wDivs.push(wDiv)

      }
      wDivs.push(createElement("div", {
        textContent: `Workspace ${w.name}#${w.id}`,
        children: wDiv
      }))
    }

    return (createElement("div", {
      children: wDivs
    }))
  }

  //--------------------------------------------------------------------------------------------------------------
  async renderProjectsInWorkspace(w) {
    let wDiv = []
    for (let p of w.projects) {
      let userSelectBox = await this.buildUserSelectBox()
      let addUserRightsButton = buildAddRightsButton(`addRightsToProject-${p.id}`,
        this,
        {
          action: "addUserToProject",
          projectId: p.id,
          NaddRightsFn: () => alert('AddRightsFn')
        },
        false)
      wDiv.push(createElement('div', {
        style: "display:flex;border 5px;",
        children: [
          createElement('div', {
            style: "background-color : green;width : 300px;",
            textContent: `Workspace ${p.name}#${p.id}`,
          }),
          userSelectBox,
          addUserRightsButton
        ]
      }))
      wDiv.push(this.buidRightsTable('project', p.groups, p.users))
    }
    return (createElement("div", {
      //textContent: `Workspace ${w.name}#${w.id}`,
      children: wDiv
    }))
  }

  //------------------------------------------------------------------------------------------------------------------

  async renderWorkspaceHeader(w) {
    let wDiv = []
    let wsProjects = this.projects.filter((p) => { return p.workspace_id === w.id })
    //console.log(" NrenderTreeMistral() w.id", w.id, " projects", this.projects, " wsProjects ", wsProjects)
    let projectsSelectBox = await this.buildProjectsSelectBox(wsProjects)
    let addProjectRightsButton = buildAddRightsButton(`addRightsToWorkspace-${w.id}`,
      this,
      {
        action: "addProjectToWorkspace",
        workspaceId: w.id,
        NaddRightsFn: () => alert('AddRightsFn')
      },
      false)
    let userSelectBox = await this.buildUserSelectBox()
    let addUserRightsButton = buildAddRightsButton(`addRightsToWorkspace-${w.id}`,
      this,
      {
        action: "addUserToWorkspace",
        workspaceId: w.id,
        NaddRightsFn: () => alert('AddRightsFn')
      },
      false)
    wDiv.push(createElement('div', {
      style: "display:flex;border 5px;",
      children: [
        createElement('div', {
          style: "background-color : pink;width : 300px;",
          textContent: `Workspace ${w.name}#${w.id}`,
        }),
        projectsSelectBox,
        addProjectRightsButton,
        userSelectBox,
        addUserRightsButton
      ]
    }))
    return(wDiv)
  }

  //--------------------------------------------------------------------------------------------------------
  async renderTreeMistral(tree) {
    let wDivs = []
    for (let w of tree) {
      let wDiv=[]
      wDiv.push(await this.renderWorkspaceHeader(w))
      wDiv.push(this.buidRightsTable('workspace', w.groups, w.users))

      wDiv.push(await this.renderProjectsInWorkspace(w))
      wDivs.push(createElement("div", {
        //textContent: `Workspace ${w.name}#${w.id}`,
        children: wDiv
      }))
    }

    return (createElement("div", {
      children: wDivs
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
  buidRightsTable(kind, groups, users) {

    console.log("UserRightsModal.buildRightsTable()", "groups", groups, "users", users)
    let table = document.createElement('table')
    table.appendChild(this.buidRightsTableHead())
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
    users.forEach((user) => {
      console.log("UserRightsModal.buildRightsTable() tr ", "user", user)
      const row = document.createElement('tr');
      let rightsId = `${user.rightsId}`
      let radix = `rights:${rightsId}`
      let rights = this.rightsHash[rightsId]
      let hiddenRights = `<input type="hidden" class="hiddenRights" id="${radix}" value="${rights.rights}">`
      console.log("UserRightsModal.buildRightsTable() tr ", "id", rightsId, "rightsHash", this.rightsHash)

      //row.appendChild(td(""))
      //row.appendChild(td(""))
      row.appendChild(td(`${rightsId} ${hiddenRights}`))
      row.appendChild(td(`user ${user.name}#${user.id}`))
      //row.appendChild(td(rights[`${lkind}_id`]))
      //row.appendChild(td(rights[`${lkind}_name`]))
      row.appendChild(td(`${rights.target_kind}#${rights.target_id} : ${rights.rights}`))
      let isadminChecked = ((rights.rights & ISADMINFLAG) > 0) ? "checked" : ""
      let deleteChecked = ((rights.rights & DELETEFLAG) > 0) ? "checked" : ""
      let referenceChecked = ((rights.rights & REFERENCEFLAG) > 0) ? "checked" : ""
      let readChecked = ((rights.rights & READFLAG) > 0) ? "checked" : ""
      let writeChecked = ((rights.rights & WRITEFLAG) > 0) ? "checked" : ""
      //let readId = `projectsRights_read_${rightId}`
      let isadminId = this.getItemId(radix, 'isadmin', rightsId)
      row.appendChild(td(`<input class="userRightsCheckbox"
         type="checkbox"
         name="${rights.rights}"
         id="${isadminId}"
         ${isadminChecked}/>`))
      let deleteId = this.getItemId(radix, 'delete', rightsId)
      row.appendChild(td(`<input class="userRightsCheckbox"
         type="checkbox"
         name="${rights.rights}"
         id="${deleteId}"
         ${deleteChecked}/>`))
      let referenceId = this.getItemId(radix, 'reference', rightsId)
      row.appendChild(td(`<input class="userRightsCheckbox"
         type="checkbox"
         name="${rights.rights}"
         id="${referenceId}"
         ${referenceChecked}/>`))
      let readId = this.getItemId(radix, 'read', rightsId)
      row.appendChild(td(`<input class="userRightsCheckbox"
         type="checkbox"
         name="${rights.rights}"
         id="${readId}"
         ${readChecked}/>`))
      //let writeId = `projectsRights_write_${rightId}`
      let writeId = this.getItemId(radix, 'write', rightsId)
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
      console.log("RightsModal render() workspace ", e.target.value)
      myThis.targetId = e.target.value
      myThis.targetKind = 'workspace'
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
  async buildProjectsSelectBox(projects) {
    //let projects = await Project.getAll('projects', {})

    let boxName = "kanbearProjectsRightsSelectBox"

    let checkboxes = []
    //let projects = []
    console.log("RightsModal buildProjectsSelectBox()", this.projects)
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

  //--------------------------------------------------------------
  async buildWorkspacesSelectBox() {
    //let workspaces = await Workspace.getAll('workspaces', {})

    let boxName = "kanbearWorkspacesRightsSelectBox"
    let buttons = [buildAddRightsButton(boxName, this, {
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
