import { KanboardFilter } from "./KanboardFilter.mjs"
import { formatDuration, dateToString, getDurationFromNow } from "../utils/dateAndTime.mjs";
import { Kontext } from "./Kontext.mjs";
import { Assignee } from "./Assignee.mjs"
import { AssigneeDialog } from "./AssigneeDialog.mjs"
import { buildAssigneeLink } from "../utils/linkBuilder.mjs";

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

    let addAssigneeButton=this.buildAddAssigneeButton()
    let resultTitleAssignee = document.createElement('h3')
    resultTitleAssignee.appendChild(addAssigneeButton)

    let titleAssignee=document.createElement('span')
    titleAssignee.innerHTML = `Assignees list filtered by .....`
    resultTitleAssignee.appendChild(titleAssignee)

    let resultTitle=document.createElement("div")
    //resultTitle.appendChild(resultTitleWorkspace)
    resultTitle.appendChild(resultTitleAssignee)


    
    const elementHeader = `${this.htmlElement}Header`
    document.getElementById(this.htmlElement).replaceChildren()
    document.getElementById(elementHeader).replaceChildren(resultTitle)
    await this.createTable()
    result.appendChild(this.table)
  }

  //------------------------------------------------------------------------
  buildAddAssigneeButton() {
    //let projectId = this.project.id
    const addAssigneeButton = document.createElement('button')
    addAssigneeButton.classList.add("add-item-btn")
    addAssigneeButton.setAttribute("id", "addSwimlaneButton")
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
        <th>Description</th>
        <th>Tel</th>
        <th>Email</th>
        `
    thead.appendChild(hrow)
    this.table.appendChild(thead)
    const tbody = document.createElement('tbody')

    Object.entries(assignees).forEach((assigneeEntity) => {
      const assignee=assigneeEntity[1]
      console.log("KanbearAssigneePanel.createTable() <assignee>",assignee)
      const row = document.createElement('tr');
      
      const td=(p)=>{
        const td =document.createElement('td')
        td.innerHTML=p
        return(td)
      }
      const tdHref=(href)=>{
        const td =document.createElement('td')
        td.appendChild(href)
        return(td)
      }
      row.appendChild(td('<input type="checkbox"/>'))
      row.appendChild(tdHref(buildAssigneeLink(assignee.id,assignee.name)))
      row.appendChild(td(assignee.description))
      row.appendChild(td(assignee.tel))
      row.appendChild(td(assignee.email))
      tbody.appendChild(row);
    }
    );
    this.table.appendChild(tbody)
  }


}
export { KanbearAssigneePanel }
