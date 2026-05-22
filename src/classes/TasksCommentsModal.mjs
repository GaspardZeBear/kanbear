import { KanbearEntityFactory } from './KanbearEntityFactory.mjs'
import { TasksComments } from './TasksComments.mjs'
import { TasksCommentsDialog } from './TasksCommentsDialog.mjs'
import { sendEvent } from '../utils/sendEvent.mjs'
import { formatDuration, dateToString, getDurationFromNow } from "../utils/dateAndTime.mjs";

class TasksCommentsModal {


  //------------------------------------------------------------------------
  constructor(taskId) {
    this.taskId = taskId
    this.dialog = document.getElementById(`tasksCommentsModal`)
    //document.getElementById(`taskCommentsDialogTitle`).innerHTML="www"
    this.dialog.showModal();
    this.htmlElement = `tasksCommentsModalResults`
    this.createListeners(this)
    this.render()
  }

  //-----------------------------------------------------------------
  async render() {
    const result = document.getElementById(this.htmlElement);
    //document.getElementById(this.htmlElement).innerHTML = `<h2>${this.project.name} filtered by ...</h2>`

    let resultTitleTasksComments = document.createElement('h3')
    let exitTasksCommentsButton = this.buildExitTasksCommentsButton()
    resultTitleTasksComments.appendChild(exitTasksCommentsButton)
    let addTasksCommentsButton = this.buildAddTasksCommentsButton()
    resultTitleTasksComments.appendChild(addTasksCommentsButton)
    let delTasksCommentsButton = this.buildDelTasksCommentsButton()
    resultTitleTasksComments.appendChild(delTasksCommentsButton)

    let titleTasksComments = document.createElement('span')
    titleTasksComments.innerHTML = `TasksComments list filtered by .....`
    resultTitleTasksComments.appendChild(titleTasksComments)

    let resultTitle = document.createElement("div")
    //resultTitle.appendChild(resultTitleWorkspace)
    resultTitle.appendChild(resultTitleTasksComments)

    const elementHeader = `tasksCommentsModalHeader`
    document.getElementById(this.htmlElement).replaceChildren()
    document.getElementById(elementHeader).replaceChildren(resultTitle)
    await this.createTable()
    result.replaceChildren(this.table)

  }

  //---------------------------------------------------------------------
  async createListeners(thisClass) {
    document.addEventListener("tasksCommentsCreated", async (ev) => {
      console.log("index.mjs() tasksCommentsCreated listener fired <ev>", ev)
      thisClass.render()
    })
    document.addEventListener("tasksCommentsDeleted", async (ev) => {
      console.log("index.mjs() tasksCommentsDeleted listener fired <ev>", ev)
      thisClass.render()
    })
  }

//------------------------------------------------------------------------
  buildExitTasksCommentsButton() {
    //let projectId = this.project.id
    const exitTasksCommentsButton = document.createElement('button')
    exitTasksCommentsButton.classList.add("add-item-btn")
    exitTasksCommentsButton.setAttribute("id", "exitTasksCommentsButton")
    exitTasksCommentsButton.innerHTML = "Exit"
    const myThis = this
    let exitTasksCommentsFn = async function (ev) {
      console.log("exitTaskCommentButton event Listener fired")
      ev.stopPropagation();
      document.getElementById(`tasksCommentsModal`).close()
    }
    //let dialog = document.getElementById(`tasksCommentsModal`)
    exitTasksCommentsButton.addEventListener('click', exitTasksCommentsFn, { once: false });
    return (exitTasksCommentsButton)
  }


  //------------------------------------------------------------------------
  buildDelTasksCommentsButton() {
    //let projectId = this.project.id
    const delTasksCommentsButton = document.createElement('button')
    delTasksCommentsButton.classList.add("add-item-btn")
    delTasksCommentsButton.setAttribute("id", "delTasksCommentsButton")
    delTasksCommentsButton.innerHTML = "-C"
    const myThis = this
    const taskId=this.taskId
    let delTasksCommentsFn = async function (ev) {
      console.log("delTaskCommentButton event Listener fired")
      ev.stopPropagation();
      const toDelete = Array.from(document.querySelectorAll('input.tasksCommentsCheckbox')).filter(input => input.checked);

      // Never use await in forEach!!!!! 
      for (let toDel of toDelete) {
        console.log("KanbearTasksCommentsPanel <toDel>", toDel.getAttribute("tasksCommentsid"))
        const tasksComments = new TasksComments()
        tasksComments.setId(toDel.getAttribute("tasksCommentsid"))
        await tasksComments.delete()
      }
      sendEvent('tasksCommentsDeleted', { taskId: taskId, "ids": [] })
      console.log("KanbearTasksCommentsPanel <tasksCommentsDeletedEvent>", toDelete)
    }
    delTasksCommentsButton.addEventListener('click', delTasksCommentsFn, { once: false });
    return (delTasksCommentsButton)
  }

  //------------------------------------------------------------------------
  buildAddTasksCommentsButton() {
    //let projectId = this.project.id
    const addTasksCommentsButton = document.createElement('button')
    addTasksCommentsButton.classList.add("add-item-btn")
    addTasksCommentsButton.setAttribute("id", "addTasksCommentsButton")
    addTasksCommentsButton.innerHTML = "+C"
    let taskId = this.taskId
    let addTasksCommentsFn = function (ev) {
      console.log("addTasksCommentsButton event Listener fired")
      ev.stopPropagation();
      const tasksComments = new TasksCommentsDialog('tasksComments', { taskId: taskId })
      tasksComments.create();
      sendEvent('tasksCommentsCreated', { taskId: taskId })
    }
    //removeEventListener("click", addSwimlaneFn)
    addTasksCommentsButton.addEventListener('click', addTasksCommentsFn, { once: false });
    return (addTasksCommentsButton)
  }

  //------------------------------------------------------------------------
  async createTable() {
    const tasksComments = await TasksComments.getAll('tasks_comments')
    console.log("TasksCommentsDialog.filltable()", "<taskComments>", tasksComments)
    this.table = document.createElement('table')
    const thead = document.createElement('thead')
    const hrow = document.createElement('tr')
    hrow.innerHTML = `
        <th>Sel</th>
        <th>Id</th>
        <th>Created</th>
        <th>Modified</th>
        <th>User</th>
        <th>Comment</th>
        <th>Reference</th>
        `
    thead.appendChild(hrow)
    this.table.appendChild(thead)
    const tbody = document.createElement('tbody')

    Object.entries(tasksComments).forEach((tasksCommentsEntity) => {
      const tasksComments = tasksCommentsEntity[1]
      //console.log("KanbearTasksCommentsPanel.createTable() <tasksComments>", tasksComments)
      const row = document.createElement('tr');

      const td = (p) => {
        const td = document.createElement('td')
        td.innerHTML = p
        return (td)
      }
      const tdHref = (href) => {
        const td = document.createElement('td')
        td.appendChild(href)
        return (td)
      }
      const id = "tasksCommentsSel"
      row.appendChild(td('<input class="tasksCommentsCheckbox" tasksCommentsId=' + tasksComments.id + ' type="checkbox"/>'))
      //row.appendChild(tdHref(buildTasksCommentsLink(tasksComments.id, tasksComments.name)))
      row.appendChild(td(tasksComments.id))
      row.appendChild(td(dateToString(tasksComments.date_created)))
      row.appendChild(td(dateToString(tasksComments.date_modified)))
      row.appendChild(td(tasksComments.user_id))
      row.appendChild(td(tasksComments.comment))
      row.appendChild(td(tasksComments.reference))
      row.appendChild(td("Delete"))
      tbody.appendChild(row);
    }
    );
    this.table.appendChild(tbody)
  }

}

export { TasksCommentsModal }
