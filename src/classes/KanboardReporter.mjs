// kanboardReporter.js
//const axios = require('axios');
import { KanboardRPC } from '../classes/KanboardRPC.mjs';

class KanboardReporter {


  constructor(kanboardUrl, apiToken) {
    this.kanboardUrl = kanboardUrl;
    this.apiToken = apiToken;
    this.kanboardRPC = new KanboardRPC(this.kanboardUrl, this.apiToken)
  }

  //-----------------------------------------------------
  async getJsonReport() {
    const projects = await this.kanboardRPC.getProjects();
    if (!projects.length) {
      console.error('No project found');
      return;
    }
    const tasksPromises = projects.map((project) => this.kanboardRPC.getTasks(project.id));
    const tasksResults = await Promise.all(tasksPromises);
    const columnsPromises = projects.map((project) => this.kanboardRPC.getColumns(project.id));
    const swimlanesPromises = projects.map((project) => this.kanboardRPC.getSwimlanes(project.id));
    const columnsResults = await Promise.all(columnsPromises);
    const swimlanesResults = await Promise.all(swimlanesPromises);
    
    //-------------------------------------------------
    //Build a structure 
    // Projects []
    //   -> Columns {}
    //   -> Swimlanes {}
    //      ->Tasks {}
    //-----------------------------------------------
    projects.forEach((project, index) => {
      project.swimlanes = {}
      project.columns = {}
      swimlanesResults[index].forEach((swimlane) => {
        project.swimlanes[swimlane.id] = swimlane
        project.swimlanes[swimlane.id].tasks = {}
      }
      )
      project.columns = {}
      columnsResults[index].forEach((column) => {
        project.columns[column.id] = column
      })
      tasksResults[index].forEach((task) => {
        project.swimlanes[task.swimlane_id].tasks[task.id] = task
      })
    })
    return (projects)
  }
}

export { KanboardReporter }
