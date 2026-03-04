import { KanboardFilter } from "./KanboardFilter.mjs"
import { formatDuration, dateToString, getDurationFromNow } from "../utils/formatDuration.mjs";
import { Kontext } from "./Kontext.mjs";

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
    console.log(this.projects[projectId].swimlanes[swimlaneId].tasks," --- ",taskId)
    let columnId = this.projects[projectId].swimlanes[swimlaneId].tasks[taskId].column_id
    let project=this.projects[projectId]
    let task = this.projects[projectId].swimlanes[swimlaneId].tasks[taskId]
    let column = this.projects[projectId].columns[columnId]
    return([name,project,column,task])
  }

  //-----------------------------------------------------------------------------------------
  dueShiftTask(ref) {
    //let [name, projectId, swimlaneId, taskId] = ref.split(':')
    //let columnId = this.projects[projectId].swimlanes[swimlaneId].tasks[taskId].column_id
    //let task = this.projects[projectId].swimlanes[swimlaneId].tasks[taskId]
    const [name,project,column,task] = this.getObjectsFromRef(ref)
    task.date_due += 10000
    //console.log(projects[projectId].swimlanes)
    //console.log(projects[projectId].swimlanes[swimlaneId].tasks)
    //console.log(projects[projectId].swimlanes[swimlaneId].tasks[taskId])
    //console.log(" columnId ", columnId)
    //console.log(" columnId ", this.projects[projectId].columns[columnId])
    //console.log(" task id ", this.projects[projectId].columns[columnId].title)
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
    //  document.body.appendChild(dueShiftButton)
    result.replaceChildren(this.buttons['dueShift'])
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

    this.projects.forEach((project, projectIndex) => {
      let jpd = {}
      try {
        jpd = JSON.parse(project.description)
      } catch (e) {
        console.log(e)
      }
      const projectDescription = (jpd && jpd.style !== undefined) ? { style: jpd.style } : { style: "background-color:yellow" };
      Object.entries(project.swimlanes).forEach(([sKey, swimlane]) => {
        Object.entries(swimlane.tasks).forEach(([tKey, task]) => {
          let userName=""
          if ( project.users[task.owner_id] && project.users[task.owner_id].name ) {
            userName=project.users[task.owner_id].name
          }
          const keep=this.kanboardFilter.keep(project.name, swimlane.name, task.title, project.columns[task.column_id].title, userName)
          console.log("Owner ",project.users[task.owner_id]," ",userName)
          if (keep) {
            console.log('append to table')
            const row = document.createElement('tr');
            const duration = formatDuration((Date.now() / 1000 - task.date_moved))
            const ref = `${projectIndex}:${swimlane.id}:${task.id}`
            row.innerHTML = `
              <td><input type="checkbox" name="tasks" id="checkbox:${ref}" class="taskCheckbox"/></td>
              <td><a href="#" class="taskCommentLink" id="commentLink:${ref}">c</a></td>
              <td style="${projectDescription.style}">${project.name}</td>
              <td>${swimlane.name}</td>
              <td>${task.title}</td>
              <td style="background-color:${task.color_id}">${project.columns[task.column_id].title}</td>
              <td>${dateToString(task.date_moved)}</td>
              <td>${getDurationFromNow(task.date_moved, true)}</td>
              <td>${dateToString(task.date_due)}</td>
              <td>${getDurationFromNow(task.date_due, true) ?? ''}</td>
              <td>${userName}</td>
            `;
            tbody.appendChild(row);
          }
        })
      });
      this.table.appendChild(tbody)
    });
  }

  //-----------------------------------------------------------------
  setPopup() {
    const self=this
    document.querySelectorAll('.taskCommentLink').forEach(link => {
      //console.log(link)
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const [name,project,column,task] = self.getObjectsFromRef(this.getAttribute('id'))
        document.getElementById('popupTaskId').textContent = task.title;
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
