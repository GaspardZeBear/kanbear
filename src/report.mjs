import { KanboardReporter } from './classes/KanboardReporter.mjs';

document.getElementById('loadReport').addEventListener('click', async () => {
  document.getElementById('loadTime').innerHTML = new Date().toLocaleString();
  const projectRegex = new RegExp(document.getElementById('projectFilter').value);
  const swimlaneRegex = new RegExp(document.getElementById('swimlaneFilter').value);
  const taskRegex = new RegExp(document.getElementById('taskFilter').value);
  const columnRegex = new RegExp(document.getElementById('columnFilter').value);

  //let kanboardReporter=new KanboardReporter(
  //    'http://A6.mshome.net:1961/kanboard-1.2.50/jsonrpc.php',
  //    'Basic YWRtaW46YWRtaW4='
  //  )
  // const projects = await kanboardReporter.getJsonReport()
  try {
    const response = await fetch('http://localhost:3001/api/report');
    const report = await response.json();
    console.log(report);

    const filteredReport = report.filter(item =>
      projectRegex.test(item.project) &&
      swimlaneRegex.test(item.swimlane) &&
      taskRegex.test(item.task) &&
      columnRegex.test(item.column)
    );

    //renderTable(filteredReport);
    renderTable(report);
  } catch (error) {
    console.error('Erreur:', error);
    alert('Erreur lors de la récupération du rapport.');
  }
});

function renderTable(projects) {
  const tbody = document.getElementById('reportBody');
  tbody.innerHTML = '';

  projects.forEach((project) => {
    console.log(project)

    Object.entries(project.swimlanes).forEach(([key, swimlane]) => {
      Object.entries(swimlane.tasks).forEach(([key, task]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
              <td>${project.name}</td>
              <td>${swimlane.name}</td>
              <td>${task.title}</td>
              <td>${project.columns[task.column_id].title}</td>
              <td>${new Date(1000 * task.date_moved).toUTCString()}</td>
            `;
        tbody.appendChild(row);
      })
    });

  });
}
