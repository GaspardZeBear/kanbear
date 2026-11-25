import { KanboardFilter } from "./KanboardFilter.mjs"
import { formatDuration, dateToString, getDurationFromNow } from "../utils/dateAndTime.mjs";
import { Kontext } from "./Kontext.mjs";
import { Ref } from "./Ref.mjs"
import { getFiltersMap } from "../utils/filters.mjs";
import { Task } from "./Task.mjs"
import { Project } from "./Project.mjs"
import { getPastille, getOpenCloseSymbol, getOpenCloseParmBoolean } from "../utils/openClose.mjs";
import { SmartTable } from "./SmartTable.mjs";
import { createElement } from "../utils/createHtml.mjs";
import { KanbanPanel } from "./KanbanPanel.mjs";

//import { buildWorkspaceLink } from "../utils/linkBuilder.mjs";

class KanbearListPanel {

  constructor(projects) {
    this.projects = projects
    this.htmlElement = 'results'
    this.kanboardFilter = new KanboardFilter(getFiltersMap())
    this.buttons = {}
    this.table = undefined
  }

  //------------------------------------------------------------------------
  // hint to have a kind of async construtor
  //----------------------------------------------------------
  static async builder() {
    console.log("KanbearListPanel.builder()")
    //if ( !Kontext.getWorkspaceId()) {
    //  throw new Error("No workspace selected")
    //}
    const isOpen = document.getElementById("projectsOpenedCheckbox").checked;
    const isClosed = document.getElementById("projectsClosedCheckbox").checked;
    const openClosed = getOpenCloseParmBoolean('project', isOpen, isClosed)
    let parms = {}
    if (Kontext.getWorkspaceId() > 0) {
      parms = { workspace_id: Kontext.getWorkspaceId() }
    }
    if (!(openClosed === undefined)) {
      parms["is_open"] = openClosed
    }
    console.log("KanbearListPanel.builder() <parms>", parms)
    const projects = await Project.getAll('projects', parms)
    Kontext.setPanelClass(KanbearListPanel)
    return new KanbearListPanel(projects)
  }

  //-----------------------------------------------------------------------------------------
  getObjectsFromRef(ref) {
    let [name, projectId, swimlaneId, taskId] = ref.split(':')
    console.log(ref)
    console.log(this.projects[projectId].swimlanes[swimlaneId].tasks, " --- ", taskId)
    let columnId = this.projects[projectId].swimlanes[swimlaneId].tasks[taskId].column_id
    let project = this.projects[projectId]
    let task = this.projects[projectId].swimlanes[swimlaneId].tasks[taskId]
    let column = this.projects[projectId].columns[columnId]
    return ([name, project, column, task])
  }

  //-----------------------------------------------------------------------------------------
  dueShiftTask(ref) {
    //let [name, projectId, swimlaneId, taskId] = ref.split(':')
    //let columnId = this.projects[projectId].swimlanes[swimlaneId].tasks[taskId].column_id
    //let task = this.projects[projectId].swimlanes[swimlaneId].tasks[taskId]
    const [name, project, column, task] = this.getObjectsFromRef(ref)
    task.date_due += 10000
    //console.log(projects[projectId].swimlanes)
    //console.log(projects[projectId].swimlanes[swimlaneId].tasks)
    //console.log(projects[projectId].swimlanes[swimlaneId].tasks[taskId])
    //console.log(" columnId ", columnId)
    //console.log(" columnId ", this.projects[projectId].columns[columnId])
    //console.log(" task id ", this.projects[projectId].columns[columnId].name)
  }

  //-----------------------------------------------------------------------------------------
  moveTask(ref) {
    console.log("move ", ref)
    let [projectId, swimlaneId, taskId] = ref.split(':')
  }

  //-----------------------------------------------------------------------------------------
  closeTask(ref) {
    console.log(" close ", ref)
    let [projectId, swimlaneId, taskId] = ref.split(':')
  }

  //----------------------------------------------------------------
  createButton(name, func) {
    const button = document.createElement('button')
    button.innerText = name
    button.id = `${name}Button`
    button.addEventListener('click', () => {
      const checkedBoxes = document.querySelectorAll('.taskCheckbox:checked');
      const checkedIds = Array.from(checkedBoxes).map(checkbox => checkbox.id);
      //alert(checkedIds.join(','))
      checkedIds.forEach((ref) => func(ref))
    }
    )
    return (button)
  }

  //-----------------------------------------------------------------
  async render() {
    this.createButtons()
    await this.createTable()
    //console.log(this.table)
    let t = new SmartTable(this.table)
    const result = document.getElementById(this.htmlElement);
    //document.getElementById(this.htmlElement).innerHTML = `<h2>${this.project.name} filtered by ...</h2>`
    let resultTitle = document.createElement('h2')
    //let workspaceLink = buildWorkspaceLink(Kontext.getWorkspaceId(), Kontext.getWorkspaceName())
    resultTitle.innerHTML = `Workspace ${Kontext.getWorkspaceId()} ${Kontext.getWorkspaceName()} filtered by .....`
    const elementHeader = `${this.htmlElement}Header`
    document.getElementById(this.htmlElement).replaceChildren()
    document.getElementById(elementHeader).replaceChildren(resultTitle)
    //  document.body.appendChild(dueShiftButton)
    //result.replaceChildren(this.buttons['dueShift'])
    result.appendChild(this.buttons['dueShift'])
    result.appendChild(this.buttons['move'])
    result.appendChild(this.buttons['close'])
    result.appendChild(this.table)

    //this.setPopup()
  }

  //-----------------------------------------------------------------
  createButtons() {
    this.buttons['dueShift'] = this.createButton('dueShift', this.dueShiftTask.bind(this))
    this.buttons['move'] = this.createButton('move', this.moveTask.bind(this))
    this.buttons['close'] = this.createButton('close', this.closeTask.bind(this))
  }

  //---------------------------------------------------------------------------------------
  async getJsonBulkData(projectId) {
    let jsonBulkData = await Kontext.loadKanbearJsonBulkData({ useKontext: false, projectId: projectId })
    return (jsonBulkData)
  }

  //------------------------------------------------------------------------------------
  td(p) {
    return (createElement('td', {
      innerHTML: p
    }))
  }

  //------------------------------------------------------------------------------------
  tdElement(self = {}) {
    return (createElement('td', {
      children: [children]
    }))
  }

  //------------------------------------------------------------------------------------
  tdElement(self = {}) {
    return (createElement('td', self))
  }

  //-----------------------------------------------------------------
  async createTable() {
    this.table = document.createElement('table')
    const thead = document.createElement('thead')
    const hrow = document.createElement('tr')
    hrow.innerHTML = `
        <th>Sel</th>
        <th>Action</th>
        <th>Workspace</th>
        <th>Project</th>
        <th>Swimlane</th>
        <th>Column</th>
        <th>Task</th>
        <th>Note</th>
        <th>Since</th>
        <th>Duration</th>
        <th>Due</th>
        <th>Duration</th>
        <th>Assignee</th>
      `
    thead.appendChild(hrow)
    this.table.appendChild(thead)
    const tbody = document.createElement('tbody')

    console.log("KanbearListPanel.createTable() <projects>", this.projects)
    //Object.entries(this.projects).forEach(([projectId, project]) => {

    for (let p of this.projects) {
      const projectM = await this.getJsonBulkData(p.id)
      console.log("KanbearListPanel.createTable() <projectM>", projectM)
      if (!projectM[p.id]) { continue }
      const project = projectM[p.id]
      console.log("KanbearListPanel.createTable() <project>", project)
      if (!this.kanboardFilter.keepProject(project.name)) { continue }
      if (!this.kanboardFilter.keepWorkspace(project.workspace.name)) { continue }
      Object.entries(project.swimlanes).forEach(([sKey, swimlane]) => {
        if (!this.kanboardFilter.keepSwimlane(swimlane.name)) { return }
        Object.entries(swimlane.tasks).forEach(([tKey, task]) => {
          if (!this.kanboardFilter.keepTask(task.name)) { return }
          console.log("KanbearListPanel.createTable() <task>", task)
          if (task.assignee_id) {
            if (!this.kanboardFilter.keepAssignee(project.assignees[task.assignee_id].name)) { return }
          } else {
            if (!this.kanboardFilter.keepAssignee("")) { return }
          }
          if (!this.kanboardFilter.keepColumn(project.columns[task.column_id].name)) { return }
          let userName = ""
          if (project.users[task.owner_id] && project.users[task.owner_id].name) {
            userName = project.users[task.owner_id].name
          }
          let taskEntity = new Task(task)
          const row = document.createElement('tr');
          const duration = formatDuration((Date.now() / 1000 - task.date_moved))
          const checkBoxId = Ref.getRef('checkbox', project.id, swimlane.id, task.id)
          const commentLinkId = Ref.getRef('commentLink', project.id, swimlane.id, task.id)

          const projectKanban = document.createElement('span')

          const kanban = createElement('a', {
            href: "#",
            textContent: project.name,
            'onclick': async () => {
              Kontext.setProject(project.id)
              const k = await KanbanPanel.builder()
              k.render()
            }
          });

          row.appendChild(this.tdElement({
            children: [createElement("input", {
              type: "checkbox",
              id: checkBoxId,
              classes: ['taskCheckbox']
            })]
          }))
          row.appendChild(this.tdElement({
            children: [createElement("a", {
              href: "#",
              id: commentLinkId,
              innerHTML: "Comments",
              classes: ["taskCommentLink"]
            })]
          }))
          console.log("xxx",project)
          row.appendChild(this.td(`${getPastille(project.workspace.is_open)} ${project.workspace.name}`))
          //row.appendChild(this.td(`${getPastille(project.is_open)} ${project.name}`))
          row.appendChild(this.tdElement({ children: [
            createElement('span',{
              textContent : `${getPastille(project.is_open)}`
            }),
              kanban] }))
              row.appendChild(this.td(`${getPastille(swimlane.is_open)} SWIM ${swimlane.name}`))
           row.appendChild(this.tdElement({
            style: `background-color:${project.columns[task.column_id].color}`,
            textContent: `COL ${project.columns[task.column_id].name}`
          }))
          
          row.appendChild(this.tdElement({
            style: `background-color:${taskEntity.getTaskDisplayColor(project.columns[task.column_id])}`,
            children: [
              createElement('span', {
                textContent: `${getPastille(task.is_open)} TASK ${task.name}`
              })]
          }))
          row.appendChild(this.td(`${task.note}`))
          row.appendChild(this.td(`${dateToString(task.date_moved)}`))
          row.appendChild(this.td(`${getDurationFromNow(task.date_moved, true)}`))
          row.appendChild(this.td(`${dateToString(task.date_due)}`))
          row.appendChild(this.td(`${getDurationFromNow(task.date_due, true) ?? ''}`))
          row.appendChild(this.td(`${project.assignees[task.assignee_id]?.name || ""}`))
          //`style="background-color:${project.columns[task.column_id].color}">${project.columns[task.column_id].name}`))
          /*
          row.innerHTML = `
              <td><input type="checkbox" name="tasks" id="${checkBoxId}" class="taskCheckbox"/></td>
              <td><a href="#" class="taskCommentLink" id="${commentLinkId}">c</a></td>
              <td>${project.workspace.name}</td>
              <td>${getPastille(project.is_open)} ${project.name} </td>
              <td>${getPastille(swimlane.is_open)} ${swimlane.name}</td>
              <td style="background-color:${project.columns[task.column_id].color}">${project.columns[task.column_id].name}</td>
              <td style="background-color:${taskEntity.getTaskDisplayColor(project.columns[task.column_id])}">${getPastille(task.is_open)} ${task.name}</td>
              <td>${dateToString(task.date_moved)}</td>
              <td>${getDurationFromNow(task.date_moved, true)}</td>
              <td>${dateToString(task.date_due)}</td>
              <td>${getDurationFromNow(task.date_due, true) ?? ''}</td>
              <td>${project.assignees[task.assignee_id]?.name || ""}</td>
            `;
            */
          tbody.appendChild(row);
        })
      });
      this.table.appendChild(tbody)
    };
  }

}
export { KanbearListPanel }
