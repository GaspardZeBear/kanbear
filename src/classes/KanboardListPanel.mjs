import { KanboardFilter } from "./KanboardFilter.mjs"
import { formatDuration, dateToString, getDurationFromNow } from "../utils/formatDuration.mjs";

class KanboardListPanel {
  constructor(projects, element, filtersMap) {
    this.projects = projects
    this.htmlElement = element
    this.kanboardFilter = new KanboardFilter(filtersMap)
    this.buttons = {}
    this.table = undefined
    }

  //-----------------------------------------------------------------------------------------
  dueShiftTask(ref) {
    console.log(self)
    console.log(this.projects)
    let [projectId, swimlaneId, taskId] = ref.split(':')
    let columnId = this.projects[projectId].swimlanes[swimlaneId].tasks[taskId].column_id
    let task = this.projects[projectId].swimlanes[swimlaneId].tasks[taskId]
    task.date_due += 10000
    //console.log(projects[projectId].swimlanes)
    //console.log(projects[projectId].swimlanes[swimlaneId].tasks)
    //console.log(projects[projectId].swimlanes[swimlaneId].tasks[taskId])
    console.log(" columnId ", columnId)
    console.log(" columnId ", this.projects[projectId].columns[columnId])
    console.log(" task id ", this.projects[projectId].columns[columnId].title)
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
  <th>sel</th>
        <th>Project</th>
        <th>Swimlane</th>
        <th>Task</th>
        <th>Column</th>
        <th>Since</th>
        <th>Duration</th>
        <th>Due</th>
        <th>Duration</th>
      `
    thead.appendChild(hrow)
    this.table.appendChild(thead)
    const tbody = document.createElement('tbody')

    this.projects.forEach((project, projectIndex) => {
      //console.log(project)
      let jpd = {}
      try {
        jpd = JSON.parse(project.description)
        //console.log('parse OK')
      } catch (e) {
        console.log(e)
      }
      const projectDescription = (jpd && jpd.style !== undefined) ? { style: jpd.style } : { style: "background-color:yellow" };
      Object.entries(project.swimlanes).forEach(([key, swimlane]) => {
        Object.entries(swimlane.tasks).forEach(([key, task]) => {
          if (this.kanboardFilter.keep(project.name, swimlane.name, task.title, project.columns[task.column_id].title)) {
            const row = document.createElement('tr');
            const duration = formatDuration((Date.now() / 1000 - task.date_moved))
            row.innerHTML = `
              <td><input type="checkbox" name="tasks" id="${projectIndex}:${swimlane.id}:${task.id}" class="taskCheckbox"/></td>
              <td style="${projectDescription.style}">${project.name}</td>
              <td>${swimlane.name}</td>
              <td>${task.title}</td>
              <td style="background-color:${task.color_id}">${project.columns[task.column_id].title}</td>
              <td>${dateToString(task.date_moved)}</td>
              <td>${getDurationFromNow(task.date_moved, true)}</td>
              <td>${dateToString(task.date_due)}</td>
              <td>${getDurationFromNow(task.date_due, true) ?? ''}</td>
            `;
            tbody.appendChild(row);
          }
        })
      });
      this.table.appendChild(tbody)
      //document.getElementById('results').replaceChildren(table)

    });
  }


}
export { KanboardListPanel }
