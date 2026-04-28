import { KanboardFilter } from "./KanboardFilter.mjs"
import { formatDuration, dateToString, getDurationFromNow } from "../utils/dateAndTime.mjs";
import { Kontext } from "./Kontext.mjs";
import { Workspace } from "./Workspace.mjs";
import { Project } from "./Project.mjs";
import { Swimlane } from "./Swimlane.mjs";
import { Column } from "./Column.mjs";
import { KanbearEntityFactory } from "./KanbearEntityFactory.mjs";
import { Task } from "./Task.mjs";
import { Ref } from "./Ref.mjs"
import { selectBoxBuilder } from "../utils/selectBoxBuilder.mjs";
import { log } from '../utils/logListBuilder.mjs'
import { getFiltersMap } from "../utils/filters.mjs";

class KanbearMigrator {
  constructor() {
    //this.project = Kontext.getCurrentProject()
    this.htmlElement = 'results'
    this.kanboardFilter = new KanboardFilter(getFiltersMap())
    this.buttons = {}
    this.table = undefined
    let resultTitle = document.createElement('h2')
    resultTitle.innerHTML = `Migrating from kanboard`
    //document.getElementById(this.htmlElement).replaceChildren(resultTitle)

    const elementHeader = `${this.htmlElement}Header`
    //document.getElementById(this.htmlElement).replaceChildren(resultTitle)
    document.getElementById(elementHeader).replaceChildren(resultTitle)
    document.getElementById(this.htmlElement).replaceChildren()
  }

  //----------------------------------------------------------------
  async createNewWorkspace(name) {
    let targetNewWorkspaceName = prompt("New workspace name : ")
    const ws = await KanbearEntityFactory.generate('workspace')
    ws.setName(targetNewWorkspaceName)
    await ws.create()
    const workspaceCreatedEvent = new CustomEvent("workspaceCreated", {
      detail: { workspaceId: ws.getId() },
      bubbles: true,
      cancelable: true,
      composed: true
    })
    document.dispatchEvent(workspaceCreatedEvent)
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

  //---------------------------------------------------------------------------------
  forLoop(project) {
    let swimlanes = []
    let tasks = []
    let columns = []

    // async in foreach is trick, let's try to convert to arrays
    Object.entries(project.swimlanes).forEach(([sKey, swimlane]) => {
      swimlanes.push(swimlane)
      Object.entries(swimlane.tasks).forEach(([tKey, task]) => {
        tasks.push(task)
      })
    })

    Object.entries(project.columns).forEach(([sKey, column]) => {
      columns.push(column)
    })


    for (let s of swimlanes) {
      console.log("of", s)
    }
    for (let t of tasks) {
      console.log("of", t)
    }
    for (let c of columns) {
      console.log("of", c)
    }
  }

  //---------------------------------------------------------------
  async createProject(wsId) {
    const pr = await KanbearEntityFactory.generate('project')
    pr.setData("workspace_id", wsId)
    pr.setName(`${this.project.name}-${new Date().toJSON()}`)
    pr.setDescription(this.project.description)
    pr.setOpen(this.project.is_open)
    await pr.create()
    return (pr)
  }

  //---------------------------------------------------------------
  async createColumns(project) {
    const newColumnsId = {}
    const persistedColumnPromises = []
    Object.entries(this.project.columns).forEach(([cKey, column]) => {
      const createColsStuff = new Promise(async (resolve, reject) => {
        let co = await KanbearEntityFactory.generate('column')
        console.log("col = ", co)
        co.setName(column.name)
        co.setDescription(column.description)
        co.setData("position", column.position)
        co.setData("project_id", project.getId())
        await co.create()
        newColumnsId[column.name] = co.getId()
        console.log("createColumns() column persisted <column.name>", column.name)
        resolve("ok")
      })
      persistedColumnPromises.push(createColsStuff)
    })

    let persistedColumns = await Promise.all(persistedColumnPromises)
    return (newColumnsId)
  }

  //---------------------------------------------------------------
  async createSwimlanes(project) {
    const newSwimlanesId = {}
    const persistedSwimlanePromises = []
    Object.entries(this.project.swimlanes).forEach(([sKey, swimlane]) => {
      //console.log("swimlanes", swimlane.name)
      const createSwimlaneStuff = new Promise(async (resolve, reject) => {
        const sw = await KanbearEntityFactory.generate('swimlane')
        sw.setName(swimlane.name)
        sw.setDescription(swimlane.description)
        sw.setData("position", swimlane.position)
        //console.log("project id", pr.getId())
        sw.setData("project_id", project.getId())
        //console.log("swimlanes", swimlane.name)
        await sw.create()
        const swId = sw.getId()
        newSwimlanesId[swimlane.name] = sw.getId()
        console.log("createSwimlanes() swimlane persisted <swimlane.name>", swimlane.name)
        resolve("ok")
      })
      persistedSwimlanePromises.push(createSwimlaneStuff)
      console.log(`Project swimlane created ${swimlane.name}`)
    })
    let persistedSwimlanes = await Promise.all(persistedSwimlanePromises)
    return (newSwimlanesId)
  }

  //-----------------------------------------------------------------
  async migrateProjectToWorkspace(wsId) {
    //this.forLoop(this.project)

    let logDiv = document.createElement("ul")
    log(logDiv, "migrateProjectToWorkspace() <project>", this.project)
    log(logDiv, `ws id ${wsId} `)

    /*
    const pr = await KanbearEntityFactory.generate('project')
    pr.setData("workspace_id", wsId)
    pr.setName(`${this.project.name}-${new Date().toJSON()}`)
    pr.setDescription(this.project.description)
    pr.setOpen(this.project.is_open)
    await createProject(wsId)
    */
    let pr = await this.createProject(wsId)

    log(logDiv, `Project envelop created `, pr)
    console.log(`Project envelop created `, pr)


    log(logDiv, "Waiting for columns")
    console.log("Waiting for columns")
    const newColumnsId = await this.createColumns(pr)
    console.log(`Project columns created`, newColumnsId)
    log(logDiv, `Project columns created ${newColumnsId}`)


    log(logDiv, "Waiting for swimlaness")
    console.log("Waiting for swimlanes")
    const newSwimlanesId = await this.createSwimlanes(pr)
    console.log(`Project swimlanes created`, newSwimlanesId)
    log(logDiv, `Project swimlanes created ${newSwimlanesId}`)


    const persistedTaskPromises = []
    Object.entries(this.project.swimlanes).forEach(async ([sKey, swimlane]) => {

      Object.entries(swimlane.tasks).forEach(([tKey, task]) => {
        const createTaskStuff = new Promise(async (resolve, reject) => {
          const ta = await KanbearEntityFactory.generate('task')
          ta.setName(task.name)
          ta.setDescription(task.description)
          ta.setData("position", task.position)
          let swName = this.project.swimlanes[task.swimlane_id].name
          ta.setData("swimlane_id", newSwimlanesId[swName])
          console.log(tKey, "source project cols", this.project.columns)
          console.log(tKey, "source task.column_id=", task.column_id)
          let colName = this.project.columns[task.column_id].name
          console.log(tKey, "colName", colName)
          ta.setData("column_id", newColumnsId[colName])
          console.log(tKey, "target task ready to be created", ta)
          await ta.create()
          console.log(tKey, "target task created", ta)
          log(logDiv, "Tasks", task.name, "created in swimlane ", swimlane.name)
          resolve("ok")
        })
        console.log(task.id, "target task creation pushed to promise array ", createTaskStuff)
        persistedTaskPromises.push(createTaskStuff)
      })

    });


    console.log("target persistedTaskPromises before Promise.all", persistedTaskPromises)
    let persistedTasks = await Promise.all(persistedTaskPromises)
    console.log("target persistedTaskPromises after Promise.all", persistedTaskPromises)


    log(logDiv, "Project migrated")

    document.getElementById(this.htmlElement).appendChild(logDiv)
    const projectCreatedEvent = new CustomEvent("projectCreated", {
      detail: { projectId: pr.getId() },
      bubbles: true,
      cancelable: true,
      composed: true
    })
    //document.querySelectorAll(".projectCreated").dispatchEvent(projectCreatedEvent)
    document.dispatchEvent(projectCreatedEvent)
    alert("Project Migrated")
  }

}
export { KanbearMigrator }
