import { KanboardFilter } from "./classes/KanboardFilter.mjs";
import { formatDuration } from "./utils/formatDuration.mjs";


function renderTable(projects, element, filtersMap) {
  const result = document.getElementById(element);
  const table = document.createElement('table')
  const thead = document.createElement('thead')
  const hrow = document.createElement('tr')
  hrow.innerHTML = `
        <th>Project</th>
        <th>Swimlane</th>
        <th>Task</th>
        <th>Column</th>
        <th>Since</th>
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
          const duration=formatDuration( (Date.now()/1000-task.date_moved) )
          row.innerHTML = `
              <td style="${projectDescription.style}">${project.name}</td>
              <td>${swimlane.name}</td>
              <td>${task.title}</td>
              <td style="background-color:${task.color_id}">${project.columns[task.column_id].title}</td>
              <td>${new Date(1000 * task.date_moved).toUTCString().slice(0,-4)}</td>
              <td>${duration}</td>
            `;
          tbody.appendChild(row);
        }
      })
    });
    table.appendChild(tbody)
    document.getElementById('results').replaceChildren(table)
  });
}

export { renderTable }
