import { KanboardFilter } from "./classes/KanboardFilter.mjs";
import { formatDuration, dateToString, getDurationFromNow } from "./utils/formatDuration.mjs";

function processTask(id) {
  console.log(" task id ",id)
}

function renderTable(projects, element, filtersMap) {
  const result = document.getElementById(element);
  //const button=document.createElement('button')
  //  <button onclick="myFunction()">Click me</button> ')
  const button = document.createElement('button')
  // Set the button text to 'Can you click me?'
  button.innerText = 'Shift'
  button.id = 'mainButton'
  // Attach the "click" event to your button
  button.addEventListener('click', () => {
    // When there is a "click"
    // it shows an alert in the browser
    const checkedBoxes = document.querySelectorAll('.taskCheckbox:checked');
    const checkedIds = Array.from(checkedBoxes).map(checkbox => checkbox.id);
    alert(checkedIds.join(','))
    checkedIds.forEach( (id) => processTask(id) )
  }
  )
  document.body.appendChild(button)
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

  projects.forEach((project) => {
    console.log(project)
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
              <td><input type="checkbox" name="tasks" id="${task.id}" class="taskCheckbox"/></td>
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
    result.replaceChildren(button)
    result.appendChild(table)
  });
}

export { renderTable }
