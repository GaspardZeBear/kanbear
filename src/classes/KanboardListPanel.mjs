import { KanboardFilter } from "./KanboardFilter.mjs"
import { formatDuration, dateToString, getDurationFromNow } from "../utils/formatDuration.mjs";
import { Kontext } from "./Kontext.mjs";
import { Ref} from "./Ref.mjs"

class KanboardListPanel {
  constructor(element, filtersMap) {
    this.projects = Kontext.getJsonBulkData()
    this.htmlElement = element
    this.kanboardFilter = new KanboardFilter(filtersMap)
    this.buttons = {}
    this.table = undefined
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
  render() {
    this.createButtons()
    this.createTable()
    const result = document.getElementById(this.htmlElement);
    //document.getElementById(this.htmlElement).innerHTML = `<h2>${this.project.name} filtered by ...</h2>`
    let resultTitle = document.createElement('h2')
    resultTitle.innerHTML = `Projects list filtered by ...`
    document.getElementById(this.htmlElement).replaceChildren(resultTitle)
    //  document.body.appendChild(dueShiftButton)
    //result.replaceChildren(this.buttons['dueShift'])
    result.appendChild(this.buttons['dueShift'])
    result.appendChild(this.buttons['move'])
    result.appendChild(this.buttons['close'])
    result.appendChild(this.table)
    this.setPopup()
  }

  //-----------------------------------------------------------------
  createButtons() {
    this.buttons['dueShift'] = this.createButton('dueShift', this.dueShiftTask.bind(this))
    this.buttons['move'] = this.createButton('move', this.moveTask.bind(this))
    this.buttons['close'] = this.createButton('close', this.closeTask.bind(this))
  }

  //-----------------------------------------------------------------
  createTable() {
    this.table = document.createElement('table')
    const thead = document.createElement('thead')
    const hrow = document.createElement('tr')
    hrow.innerHTML = `
        <th>Sel</th>
        <th>Action</th>
        <th>Project</th>
        <th>Swimlane</th>
        <th>Task</th>
        <th>Column</th>
        <th>Since</th>
        <th>Duration</th>
        <th>Due</th>
        <th>Duration</th>
        <th>Assignee</th>
      `
    thead.appendChild(hrow)
    this.table.appendChild(thead)
    const tbody = document.createElement('tbody')

    //this.projects.forEach((project, projectIndex) => {
    Object.entries(this.projects).forEach(([projectId, project]) => {
      if (!this.kanboardFilter.keepProject(project.name)) { return }
      const projectStyle = Kontext.getProjectStyle(project.name)
      Object.entries(project.swimlanes).forEach(([sKey, swimlane]) => {
        if (!this.kanboardFilter.keepSwimlane(swimlane.name)) { return }
        Object.entries(swimlane.tasks).forEach(([tKey, task]) => {
          if (!this.kanboardFilter.keepTask(task.name)) { return }
          if (!this.kanboardFilter.keepColumn(project.columns[task.column_id].name)) { return }
          let userName = ""
          if (project.users[task.owner_id] && project.users[task.owner_id].name) {
            userName = project.users[task.owner_id].name
          }
          const row = document.createElement('tr');
          const duration = formatDuration((Date.now() / 1000 - task.date_moved))
          const checkBoxId = Ref.getRef('checkbox',projectId,swimlane.id,task.id)
          const commentLinkId = Ref.getRef('commentLink',projectId,swimlane.id,task.id)
          row.innerHTML = `
              <td><input type="checkbox" name="tasks" id="${checkBoxId}" class="taskCheckbox"/></td>
              <td><a href="#" class="taskCommentLink" id="${commentLinkId}">c</a></td>
              <td style="${projectStyle}">${project.name}</td>
              <td>${swimlane.name}</td>
              <td>${task.name}</td>
              <td style="background-color:${task.color}">${project.columns[task.column_id].name}</td>
              <td>${dateToString(task.date_moved)}</td>
              <td>${getDurationFromNow(task.date_moved, true)}</td>
              <td>${dateToString(task.date_due)}</td>
              <td>${getDurationFromNow(task.date_due, true) ?? ''}</td>
              <td>${userName}</td>
            `;
          tbody.appendChild(row);
        })
      });
      this.table.appendChild(tbody)
    });
  }

  //-----------------------------------------------------------------
  setPopup() {
    const self = this
    document.querySelectorAll('.taskCommentLink').forEach(link => {
      //console.log(link)
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const [name, project, swimlane, task, column] = self.getObjectsFromRef(this.getAttribute('id'))
        document.getElementById('popupTaskId').textContent = task.name;
        popup.style.display = 'flex';
        // Charger les notes existantes si disponibles (exemple)
        // taskNotes.value = getNotesForTask(currentTaskId);
      });
    });
    document.querySelector('.close').addEventListener('click', function () {
      popup.style.display = 'none';
    });
    const popup = document.getElementById('editPopup');
    document.getElementById('editPopup').addEventListener('click', function (e) {
      if (e.target === popup) {
        popup.style.display = 'none';
      }
    });
    document.getElementById('saveNotes').addEventListener('click', function () {
      const notes = document.getElementById('taskNotes').value;
      alert(`Comment registered : ${notes}`);
      // Ici, vous pouvez envoyer les données au serveur via fetch()
      // saveNotes(currentTaskId, notes);
      popup.style.display = 'none';
    });

  }


}
export { KanboardListPanel }
