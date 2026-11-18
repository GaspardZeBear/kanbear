import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'
import { ProjectsRights } from './ProjectsRights.mjs'
import { Project } from './Project.mjs'
import { Rights } from './Rights.mjs'
import { Workspace } from './Workspace.mjs'
import { User } from './User.mjs'
import { Group } from './Group.mjs'
//import { UserRightsDialog } from './UserRightsDialog.mjs'
import { sendEvent } from '../utils/sendEvent.mjs'
import { formatDuration, dateToString, getDurationFromNow } from "../utils/dateAndTime.mjs";
import { selectBoxBuilder } from '../utils/selectBoxBuilder.mjs';
//import { buildAddProjectsRightsButton, buildAddWorkspacesRightsButton } from '../utils/buttonBuilder.mjs'
import { buildAddRightsButton } from '../utils/buttonBuilder.mjs'
import { REFERENCE, READ, WRITE, DELETE, ADMIN, RIGHT_DEFS, hasBits } from './RightsDefs.mjs'
import { createElement, buildKanbearProjectsSelectBox, buildWorkspacesSelectBox } from '../utils/createHtml.mjs';
import { buildRightsTree } from './RightsTree.mjs'

class RightsModal {

  //------------------------------------------------------------------------
  constructor() {
    this.dialog = document.getElementById(`rightsModal`)
    //document.getElementById(`taskCommentsDialogTitle`).innerHTML="www"
    this.dialog.showModal();
    this.htmlElement = `rightsModalResults`

    this.hasResetListener = false
    this.createResetListener()
    this.createListeners()
    //this.render()
  }

  //-------------------------------------------------------------------------
  async render() {
    await this.loadRights()
    await this.loadWorkspaces()
    await this.loadProjects()
    await this.loadUsers()
    await this.loadGroups()
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
    let rightsTree = buildRightsTree(this.rights,
      this.users, this.groups,
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
    this.users = await User.getAll('users')
    this.usersHash = {}
    this.users.forEach((u) => {
      this.usersHash[u.id] = u
    })
  }

  //-------------------------------------------------------------------------
  async loadGroups() {
    this.groups = await Group.getAll('groups')
    this.groupsHash = {}
    this.groups.forEach((g) => {
      this.groupsHash[g.id] = g
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


  //-----------------------------------------------------------------------------------------
  getAddRightsFn({ action, ...params }) {
    console.log("getAddRightsFn ", action, params)
    const ADD_ACTIONS = {
      addWorkspace: (m) => ({ target_kind: 'workspace', target_id: m.targetId }),
      addProjectToWorkspace: (m) => ({ target_kind: 'project', target_id: m.targetId }),
      addUserToWorkspace: (m, p) => ({
        owner_type: 'user', owner_id: m.ownerId,
        target_kind: 'workspace', target_id: p.workspaceId
      }),
      addUserToProject: (m, p) => ({
        owner_type: 'user', owner_id: m.ownerId,
        target_kind: 'project', target_id: p.projectId
      }),
      addGroupToWorkspace: (m, p) => ({
        owner_type: 'group', owner_id: m.ownerId,
        target_kind: 'workspace', target_id: p.workspaceId
      }),
      addGroupToProject: (m, p) => ({
        owner_type: 'group', owner_id: m.ownerId,
        target_kind: 'project', target_id: p.projectId
      }),
    };
    return (ev) => {
      ev.stopPropagation();

      const data = ADD_ACTIONS[action]?.(this, params);
      console.log("getAddRightsFn fired", action, params, data)
      if (!data) return console.warn('action inconnue', action);
      let rights = new Rights({})
      rights.setData("owner_type", data.owner_type);
      rights.setData("owner_id", parseInt(data.owner_id));
      rights.setData("target_kind", data.target_kind);
      rights.setData("target_id", parseInt(data.target_id));
      rights.setData("rights", 0);
      rights.create().finally(() => {
        sendEvent(`${data.target_kind}sRightsCreated`, {})
        for (let s of document.getElementsByClassName("rightsUserSelectBox")) {
          s.selectedIndex = -1
        }
      })
    };
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
      let groupSelectBox = await this.buildGroupSelectBox()
      let addGroupRightsButton = buildAddRightsButton(
        `addGroupRightsToProject-${p.id}`,
        this.getAddRightsFn({
          action: "addGroupToProject",
          projectId: p.id
        }),
        false)
      let delRightButton = this.buildDelRightButton(p.rightsId,
        (!(p.users.length === 0))
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
          addUserRightsButton,
          groupSelectBox,
          addGroupRightsButton
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
    let groupSelectBox = await this.buildGroupSelectBox()
    let addUserRightsButton = buildAddRightsButton(
      `addUserRightsToWorkspace-${w.id}`,
      this.getAddRightsFn({
        action: "addUserToWorkspace",
        workspaceId: w.id
      }),
      false)
    let addGroupRightsButton = buildAddRightsButton(
      `addGroupRightsToWorkspace-${w.id}`,
      this.getAddRightsFn({
        action: "addGroupToWorkspace",
        workspaceId: w.id
      }),
      false)
    let delRightButton = this.buildDelRightButton(w.rightsId,
      //( ! (w.users.length === 0 && w.groups.length === 0 && w.projects.length === 0) )
      (!(w.groups.length === 0 && w.users.length === 0 && w.projects.length === 0))
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
        addUserRightsButton,
        groupSelectBox,
        addGroupRightsButton]
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

  //------------------------------------------------------------------------------------
  td(p) {
    return (createElement('td', {
      innerHTML: p
    }))
  }

  //------------------------------------------------------------------------------------
  tdElement(p, label) {
    return (createElement('td', {
      children: [label, p]
    }))
  }

  //----------------------------------------------------------------------------------------
  getRow(type, elt) {
    const rights = this.rightsHash[elt.rightsId];
    const row = document.createElement('tr');

    row.appendChild(this.tdElement(this.buildDelRightButton(elt.rightsId, false)));
    row.appendChild(this.td(`${type} ${elt.name}#${elt.id}`));

    for (const def of RIGHT_DEFS) {
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.dataset.rightsId = elt.rightsId;   // ← plus de parsing d'ID
      cb.dataset.flag = def.bit;             // ← la valeur porte le bit
      cb.checked = hasBits(rights.rights, def.bit);
      const label = createElement('label', {
        textContent: def.label
      })
      row.appendChild(this.tdElement(cb, label));
    }
    return row;
  }

  //------------------------------------------------------------------------
  //users:  [ { id: 1, name: "Gaspard", rightsId: 1 } ],
  //  groups: [ { id: 10, name: "Équipe Design", rightsId: 2 } ],
  buidRightsTable(divs, cssClass, groups, users) {
    let table = createElement('table', {
    })
    //table.appendChild(this.buidRightsTableHead())
    const tbody = document.createElement('tbody')

    groups.forEach((group) => {
      tbody.appendChild(this.getRow('group', group));
    })

    users.forEach((user) => {
      tbody.appendChild(this.getRow('user', user));
    })

    table.appendChild(tbody)
    divs.push(createElement('div', {
      class: cssClass,
      children: [table]
    }))
  }

  //-------------------------------------------------------------------------
  async buildWorkspaceSelectBox() {
    let workspaceBoxName = "rightsWorkspaceSelectBox"
    let workspaceBoxParams = {
      domId: workspaceBoxName,
      boxLabel: "workspace",
      //buttons: [addWorkspaceButton],
      items: this.workspaces,
      labelText: "Workspace",
      klass: "filter-group",
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
    let userBoxParams = {
      boxLabel: "user",
      items: this.users,
      labelText: "User",
      klass: "filter-group rightsUserSelectBox",
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

  //-------------------------------------------------------------------------
  async buildGroupSelectBox() {
    let groupBoxParams = {
      boxLabel: "group",
      items: this.groups,
      labelText: "group",
      klass: "filter-group rightsGroupSelectBox",
    }
    let groupSelectBox = await selectBoxBuilder(groupBoxParams)

    let myThis = this
    groupSelectBox.addEventListener('change', async (e) => {
      console.log("RightsModal render() group ", e.target.value)
      myThis.ownerId = e.target.value
      myThis.ownerType = 'group'
    });
    return (groupSelectBox)
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
  createResetListener() {
    let myThis = this
    if (!this.hasResetListener) {
      document.addEventListener('resetRightsModalListeners', function (e) {
        console.log("RightModal resetListeners fired ", e)
        e.detail.controller.abort()
        myThis.createListeners()
      })
      this.hasResetListener = true
    }
  }

  //---------------------------------------------------------------------
  async createListeners() {
    let myThis = this
    const controller = new AbortController();
    const { signal } = controller;
    document.addEventListener("projectsRightsCreated", async (ev) => {
      console.log("RightsModal() projectsRightsCreated listener fired <ev>", ev)
      myThis.render()
    }, { signal })
    document.addEventListener("workspacesRightsCreated", async (ev) => {
      console.log("RightsModal() workspacesRightsCreated listener fired <ev>", ev)
      myThis.render()
    }, { signal })
    document.addEventListener("rightDeleted", async (ev) => {
      console.log("RightsModal() rightDeleted listener fired <ev>", ev)
      myThis.render()
    }, { signal })
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
      if (confirm(`delRightButton_${rightId}`)) {
        let rightsEntity
        rightsEntity = new Rights({})
        rightsEntity.setId(rightId)
        //rightsEntity.setData("rights", cRights)
        //rightsEntity.setData("target_type", kind)
        await rightsEntity.delete()
      }
      sendEvent("rightDeleted", {})
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

  //-----------------------------------------------------------------------
  saveRights() {
    const updated = new Map();   // éviter plusieurs patch sur la même ligne
    document.querySelectorAll('input[type=checkbox][data-rights-id]').forEach(cb => {
      const id = cb.dataset.rightsId;
      updated.set(id, (updated.get(id) ?? 0) | (cb.checked ? +cb.dataset.flag : 0));
    });
    console.log("RightsModal saveRights updated", updated)

    let patched = 0
    for (const [rightsId, newBits] of updated) {
      if (this.rightsHash[rightsId].rights !== newBits) {
        const entity = new Rights({});
        entity.setId(rightsId);
        entity.setData('rights', newBits);
        entity.patch();
        patched++
      }
    }
    patched === 0 ? alert("Nothing to change") : alert(`${patched} Rights updated`)
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
