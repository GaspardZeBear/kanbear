import { KanboardFilter } from "./KanboardFilter.mjs"
import { formatDuration, dateToString, getDurationFromNow } from "../utils/formatDuration.mjs";
import { Kontext } from "./Kontext.mjs";
import { Workspace } from "./Workspace.mjs";
import { Project } from "./Project.mjs";
import { Swimlane } from "./Swimlane.mjs";
import { Column } from "./Column.mjs";
import { KanbearEntityFactory } from "./KanbearEntityFactory.mjs";
import { Task } from "./Task.mjs";
import { Ref } from "./Ref.mjs"
import { selectBoxBuilder } from "../utils/selectBoxBuilder.mjs";

class KanbearMigrator {
  constructor(element, filtersMap) {
    //this.project = Kontext.getCurrentProject()
    this.htmlElement = element
    this.kanboardFilter = new KanboardFilter(filtersMap)
    this.buttons = {}
    this.table = undefined
    let resultTitle = document.createElement('h2')
    resultTitle.innerHTML = `Migrating from kanboard`
    document.getElementById(this.htmlElement).replaceChildren(resultTitle)
  }

  //----------------------------------------------------------------
  async createNewWorkspace(name) {
    let targetNewWorkspaceName = prompt("New workspace name : ")
    const ws = await KanbearEntityFactory.generate('workspace')
    ws.setName(targetNewWorkspaceName)
    await ws.create()
        const workspaceAddedEvent = new CustomEvent("workspaceAdded", {
      detail: { projectId: ws.getId() },
      bubbles: true,
      cancelable: true,
      composed: true
    })
    document.dispatchEvent(workspaceAddedEvent)
    return (ws.getId())
  }

  //---------------------------------------------------------------------------------
  // Kanboard load !!!
  async buildKanboardProjectsSelectBox() {
    await Kontext.loadKanboardProjects()
    let projectsMap = Kontext.kanboardProjects
    let projects = []
    // convert to array from old kanboard loading
    Object.entries(projectsMap).forEach(([id, project]) => {
      console.log(project)
      projects.push({ id: id, name: project })
    })
    console.log("buildKanboardProjectsSelectBox() : kanboard projects", projects)
    let boxName = "kanboardProjectsSelectBox"
    let boxParams = {
      domId: boxName,
      boxLabel: "project",
      items: projects,
      labelText: "kanboard Project",
      klass: "filter-group",
      //headItems:[['* Create new workspace',-1]]
    }
    //let wsDiv = await selectBoxBuilder(boxName, "workspace", wss, "target workspace")
    let wsDiv = await selectBoxBuilder(boxParams)
    document.getElementById(this.htmlElement).appendChild(wsDiv)
    document.getElementById(boxName).addEventListener('change', async (e) => {
      let kanboardProjectId = e.target.value;
      this.project = await Kontext.getKanboardProjectById(kanboardProjectId)
    });
  }

  //---------------------------------------------------------------------------------
  async buildWorkspacesSelectBox() {
    let wss = await Workspace.getAll('workspaces')
    if (wss.length == 0) {
      const ws = await KanbearEntityFactory.generate('workspace')
      ws.setName("default_workspace")
      await ws.create()
      wss = await Workspace.getAll('workspaces')
    }
    wss.unshift({ id: -1, name: '* Create new workspace' })
    console.log("KanbearMigrator.migrate", wss)
    // let wsDiv = await this.buildTargetWorkspaceSelectBox("targetWorspaceSelectBox", wss, "target workspace")
    let boxName = "targetWorkspaceSelectBox"
    let boxParams = {
      domId: boxName,
      boxLabel: "workspace",
      items: wss,
      labelText: "target workspace",
      klass: "filter-group",
      //headItems:[['* Create new workspace',-1]]
    }
    //let wsDiv = await selectBoxBuilder(boxName, "workspace", wss, "target workspace")
    let wsDiv = await selectBoxBuilder(boxParams)
    document.getElementById(this.htmlElement).appendChild(wsDiv)
    document.getElementById(boxName).addEventListener('change', async (e) => {
      let targetWorkspaceId = e.target.value;
      console.log("targetWorspaceSelectBox", e.target.value)
      if (targetWorkspaceId == -1) {
        targetWorkspaceId = await this.createNewWorkspace()
      }
      this.migrateProjectToWorkspace(targetWorkspaceId)
      //Kontext.setProject(selectedProject, "xxxx")
    });
  }

  //-----------------------------------------------------------------------------------------
  async migrate() {
    await Kontext.loadKanboardJsonBulkData()
    await this.buildKanboardProjectsSelectBox()
    await this.buildWorkspacesSelectBox()
  }

  //-----------------------------------------------------------------
  async migrateProjectToWorkspace(wsId) {
    console.log("migrateProjectToWorkspace() <project>", this.project)
    console.log("ws id ", wsId)
    const pr = await KanbearEntityFactory.generate('project')
    pr.setData("workspace_id", wsId)
    pr.setName(`${this.project.name}-${new Date().toJSON()}`)
    pr.setDescription(this.project.description)
    pr.setOpen(this.project.is_open)
    await pr.create()

    console.log("Project envelop created (empty)")
    const newColumnsId = {}
    Object.entries(this.project.columns).forEach(async ([cKey, column]) => {
      //console.log("columns", column.name)
      const co = await KanbearEntityFactory.generate('column')
      co.setName(column.name)
      co.setDescription(column.description)
      co.setData("position", column.position)
      co.setData("project_id", pr.getId())
      await co.create()
      newColumnsId[column.name] = co.getId()
    })
    console.log("Project columns created ", newColumnsId)
    Object.entries(this.project.swimlanes).forEach(async ([sKey, swimlane]) => {
      //console.log("swimlanes", swimlane.name)
      const sw = await KanbearEntityFactory.generate('swimlane')
      sw.setName(swimlane.name)
      sw.setDescription(swimlane.description)
      sw.setData("position", swimlane.position)
      //console.log("project id", pr.getId())
      sw.setData("project_id", pr.getId())
      //console.log("swimlanes", swimlane.name)
      await sw.create()
      const swId = sw.getId()
      console.log("Project swimlane created", swimlane.name)
      Object.entries(swimlane.tasks).forEach(async ([tKey, task]) => {
        //console.log("migrating task", task)
        const ta = await KanbearEntityFactory.generate('task')
        ta.setName(task.name)
        ta.setDescription(task.description)
        ta.setData("position", task.position)
        ta.setData("swimlane_id", swId)
        console.log(tKey, "source project cols", this.project.columns)
        console.log(tKey, "source task.column_id=", task.column_id)
        let colName = this.project.columns[task.column_id].name
        console.log(tKey, "colName", colName)
        ta.setData("column_id", newColumnsId[colName])
        console.log(tKey, "target task", ta)
        await ta.create()
        //console.log("tasks", task.name)
      })
      console.log("Project tasks created")
    });



    alert("Projet migrated")
    const projectAddedEvent = new CustomEvent("projectAdded", {
      detail: { projectId: pr.getId() },
      bubbles: true,
      cancelable: true,
      composed: true
    })
    document.dispatchEvent(projectAddedEvent)
  }

}
export { KanbearMigrator }
