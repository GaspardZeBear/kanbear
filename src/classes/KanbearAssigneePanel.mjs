import { KanboardFilter } from "./KanboardFilter.mjs"
import { formatDuration, dateToString, getDurationFromNow } from "../utils/dateAndTime.mjs";
import { Kontext } from "./Kontext.mjs";
import { Assignee } from "./Assignee.mjs"
import { AssigneeDialog } from "./AssigneeDialog.mjs"
import { buildAssigneeLink } from "../utils/linkBuilder.mjs";
import { sendEvent } from "../utils/sendEvent.mjs";


class KanbearAssigneePanel {
  constructor(element, filtersMap) {
    this.projects = Kontext.getJsonBulkData()
    this.htmlElement = element
    this.kanboardFilter = new KanboardFilter(filtersMap)
    this.buttons = {}
    this.table = undefined
  }

  //-----------------------------------------------------------------
  async render() {
    const result = document.getElementById(this.htmlElement);
    //document.getElementById(this.htmlElement).innerHTML = `<h2>${this.project.name} filtered by ...</h2>`

    let resultTitleAssignee = document.createElement('h3')
    let addAssigneeButton = this.buildAddAssigneeButton()
    //let resultTitleAssignee = document.createElement('h3')
    resultTitleAssignee.appendChild(addAssigneeButton)
    let delAssigneeButton = this.buildDelAssigneeButton()
    resultTitleAssignee.appendChild(delAssigneeButton)

    let titleAssignee = document.createElement('span')
    titleAssignee.innerHTML = `Assignees list filtered by .....`
    resultTitleAssignee.appendChild(titleAssignee)

    let resultTitle = document.createElement("div")
    //resultTitle.appendChild(resultTitleWorkspace)
    resultTitle.appendChild(resultTitleAssignee)

    const elementHeader = `${this.htmlElement}Header`
    document.getElementById(this.htmlElement).replaceChildren()
    document.getElementById(elementHeader).replaceChildren(resultTitle)
    await this.createTable()
    result.appendChild(this.table)
  }


  //------------------------------------------------------------------------
  buildDelAssigneeButton() {
    //let projectId = this.project.id
    const delAssigneeButton = document.createElement('button')
    delAssigneeButton.classList.add("add-item-btn")
    delAssigneeButton.setAttribute("id", "delAssigneeButton")
    delAssigneeButton.innerHTML = "D"
    const myThis = this
    let delAssigneeFn = async function (ev) {
      console.log("delAssigneeButton event Listener fired")
      ev.stopPropagation();
      const toDelete = Array.from(document.querySelectorAll('input.assigneeCheckbox')).filter(input => input.checked);

      // Never use await in forEach!!!!! 
      for (let toDel of toDelete) {
        console.log("KanbearAssigneePanel <toDel>", toDel.getAttribute("assigneeid"))
        const assignee = new Assignee()
        assignee.setId(toDel.getAttribute("assigneeid"))
        await assignee.delete()
      }
      sendEvent('assigneeDeleted', { "ids" : [] })
      console.log("KanbearAssigneePanel <assigneeDeletedEvent>",toDelete)
    }
      delAssigneeButton.addEventListener('click', delAssigneeFn, { once: true });
      return (delAssigneeButton)
    }

    //------------------------------------------------------------------------
    buildAddAssigneeButton() {
      //let projectId = this.project.id
      const addAssigneeButton = document.createElement('button')
      addAssigneeButton.classList.add("add-item-btn")
      addAssigneeButton.setAttribute("id", "addAssigneeButton")
      addAssigneeButton.innerHTML = "+A"
      let addAssigneeFn = function (ev) {
        console.log("addAssigneeButton event Listener fired")
        ev.stopPropagation();
        const assignee = new AssigneeDialog('assignee')
        assignee.create({});
      }
      //removeEventListener("click", addSwimlaneFn)
      addAssigneeButton.addEventListener('click', addAssigneeFn, { once: true });
      return (addAssigneeButton)
    }

  //-----------------------------------------------------------------
  async createTable() {
      const assignees = await Assignee.getAll('assignees')
      console.log(assignees)
      this.table = document.createElement('table')
      const thead = document.createElement('thead')
      const hrow = document.createElement('tr')
      hrow.innerHTML = `
        <th>Sel</th>
        <th>Name</th>
        <th>Tasks</th>
        <th>Description</th>
        <th>Tel</th>
        <th>Email</th>
        <th>Delete</th>
        `
      thead.appendChild(hrow)
      this.table.appendChild(thead)
      const tbody = document.createElement('tbody')

      Object.entries(assignees).forEach((assigneeEntity) => {
        const assignee = assigneeEntity[1]
        //console.log("KanbearAssigneePanel.createTable() <assignee>", assignee)
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
        const id = "assigneeSel"
        row.appendChild(td('<input class="assigneeCheckbox" assigneeId=' + assignee.id + ' type="checkbox"/>'))
        row.appendChild(tdHref(buildAssigneeLink(assignee.id, assignee.name)))
        row.appendChild(td("Tasks ..."))
        row.appendChild(td(assignee.description))
        row.appendChild(td(assignee.tel))
        row.appendChild(td(assignee.email))
        row.appendChild(td("Delete"))
        tbody.appendChild(row);
      }
      );
      this.table.appendChild(tbody)
    }

  }
export { KanbearAssigneePanel }
