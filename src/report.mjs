

function renderTable(projects, element) {
  const result = document.getElementById(element);
  const table = document.createElement('table')
  const thead = document.createElement('thead')
  const hrow = document.createElement('tr')
  hrow.innerHTML = `
        <th>Projet</th>
        <th>Swimlane</th>
        <th>Tâche</th>
        <th>Colonne</th>
        <th>Depuis</th>
      `
  thead.appendChild(hrow)
  table.appendChild(thead)
  const tbody = document.createElement('tbody')

  projects.forEach((project) => {
    console.log(project)
    let jpd = {}
    try {
      jpd = JSON.parse(project.description)
      //console.log('parse OK')
    } catch (e) {
      console.log(e)
      //jpd={}
    }
    //console.log('desc:',project.description,'jpd',jpd)
    const projectDescription = (jpd && jpd.style !== undefined) ? { style: jpd.style } : { style: "background-color:yellow" };
    //let projectDescription = ( JSON.parse(project.description)?.color ) || { color: 'blue' }
    console.log(jpd, projectDescription)
    Object.entries(project.swimlanes).forEach(([key, swimlane]) => {
      Object.entries(swimlane.tasks).forEach(([key, task]) => {
        const row = document.createElement('tr');

        row.innerHTML = `
              <td style="${projectDescription.style}">${project.name}</td>
              <td>${swimlane.name}</td>
              <td>${task.title}</td>
              <td style="background-color:${task.color_id}">${project.columns[task.column_id].title}</td>
              <td>${new Date(1000 * task.date_moved).toUTCString()}</td>
            `;
        tbody.appendChild(row);
      })
    });
    table.appendChild(tbody)
    document.getElementById('results').replaceChildren(table)
  
  });
}

export { renderTable }
