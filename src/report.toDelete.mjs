import { KanboardFilter } from "./classes/KanboardFilter.mjs";
import { formatDuration, dateToString, getDurationFromNow } from "./utils/formatDuration.mjs";

//-----------------------------------------------------------------------------------------
function dueShiftTask(projects, ref) {
  console.log(ref)
  let [projectId, swimlaneId, taskId] = ref.split(':')
  let columnId = projects[projectId].swimlanes[swimlaneId].tasks[taskId].column_id
  let task=projects[projectId].swimlanes[swimlaneId].tasks[taskId]
  task.date_due += 10000
  //console.log(projects[projectId].swimlanes)
  //console.log(projects[projectId].swimlanes[swimlaneId].tasks)
  //console.log(projects[projectId].swimlanes[swimlaneId].tasks[taskId])
  console.log(" columnId ", columnId)
  console.log(" columnId ", projects[projectId].columns[columnId])
  console.log(" task id ", projects[projectId].columns[columnId].title)
}


//-----------------------------------------------------------------------------------------
function moveTask(projects, ref) {
  console.log("move ",ref)
  let [projectId, swimlaneId, taskId] = ref.split(':')
}

//-----------------------------------------------------------------------------------------
function closeTask(projects, ref) {
  console.log(" close ",ref)
  let [projectId, swimlaneId, taskId] = ref.split(':')
}

//----------------------------------------------------------------
function createDueShiftButton(projects,name,func) {
  const button = document.createElement('button')
  button.innerText = name
  button.id = `${name}Button`
  button.addEventListener('click', () => {
    const checkedBoxes = document.querySelectorAll('.taskCheckbox:checked');
    const checkedIds = Array.from(checkedBoxes).map(checkbox => checkbox.id);
    //alert(checkedIds.join(','))
    checkedIds.forEach((ref) => func(projects, ref))
  }
  )
  return(button)
}

//-----------------------------------------------------------------
function renderTable(projects, element, filtersMap) {
  const result = document.getElementById(element);
  const dueShiftButton = createDueShiftButton(projects,'dueShift',dueShiftTask)
  const moveButton = createDueShiftButton(projects,'moveTask',moveTask)
  const closeButton = createDueShiftButton(projects,'closeTask',closeTask)


  document.body.appendChild(dueShiftButton)
  const table = document.createElement('table')
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
  table.appendChild(thead)
  const tbody = document.createElement('tbody')

  const kanboardFilter = new KanboardFilter(filtersMap)

  projects.forEach((project, projectIndex) => {
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
        if (kanboardFilter.keep(project.name, swimlane.name, task.title, project.columns[task.column_id].title)) {
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
    table.appendChild(tbody)
    //document.getElementById('results').replaceChildren(table)
    result.replaceChildren(dueShiftButton)
    result.appendChild(moveButton)
    result.appendChild(closeButton)
    result.appendChild(table)
  });
}

export { renderTable }
