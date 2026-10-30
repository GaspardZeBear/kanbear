import { KanboardFilter } from "./KanboardFilter.mjs"
import { formatDuration, dateToString, getDurationFromNow } from "../utils/dateAndTime.mjs";
import { Kontext } from "./Kontext.mjs";
import { Workspace } from "./Workspace.mjs";
import { Project } from "./Project.mjs";
import { Swimlane } from "./Swimlane.mjs";
import { Column } from "./Column.mjs";
import { KanbearEntityFactory } from "./KanbearEntityFactory.mjs";
import { Task } from "./Task.mjs";
import { Ref } from "./Ref.mjs"
import { selectBoxBuilder } from "../utils/selectBoxBuilder.mjs";
import { log } from '../utils/logListBuilder.mjs'
import { getFiltersMap } from "../utils/filters.mjs";
import { createElement } from "../utils/createHtml.mjs";

/*------------------------------------------------------------
Replaces raw delete on project
*/
class KanbearProjectCleanor {
    constructor() {
        //this.project = Kontext.getCurrentProject()
        this.htmlElement = 'results'
        this.kanboardFilter = new KanboardFilter(getFiltersMap())
        this.buttons = {}
        this.table = undefined
        document.getElementById('resultsHeader').replaceChildren(
            createElement('h2', {
                textContent: `Delete project  ${Kontext.getCurrentProject().name} operation`
            }))
        this.logDiv = document.createElement("ul")
        //let resultTitle = document.createElement('h2')
        //resultTitle.innerHTML = `Delete project  ${Kontext.getCurrentProject().name}`
        document.getElementById(this.htmlElement).replaceChildren(createElement('span'))
        //cleanup(Kontext.getCurrentProject())
    }

    //-----------------------------------------------------------------------------------
    async cleanup() {
        console.log("KanbearProjectCleanor cleanup() current project", Kontext.getCurrentProject())

        if (confirm(`Cleanor : Really delete project  ${Kontext.getCurrentProject().name} ?`)) {
            console.log("KanbearProjectCleanor cleanup() confirmed")
            let deleted = await this.doCleanup(Kontext.getCurrentProject())
            console.log("KanbearProjectCleanor cleanup() after await")
            log(this.logDiv, "Project deleted")
            document.getElementById(this.htmlElement).replaceChildren(this.logDiv)
            return (deleted)
        } else {
            let cancelTitle = document.createElement('h2')
            cancelTitle.innerHTML = `Delete cancelled`
            document.getElementById(this.htmlElement).appendChild(cancelTitle)
            return (false)
        }
    }
    //-----------------------------------------------------------------------------------
    // Cleanup all the tasks in swimlanes
    // then remove columns and swimlanes
    // then remove project
    // Beware : asynchronous !!!!! Force rendez-vous
    async doCleanup(project) {
        this.logDiv = document.createElement("ul")

        const taskDeletePromises = []
        Object.entries(project.swimlanes).forEach(([sKey, swimlane]) => {
            log(this.logDiv, "tasks in  swimlane ", swimlane.name)
            Object.entries(swimlane.tasks).forEach(async ([tKey, task]) => {
                const taskDelete = new Promise(async (resolve, reject) => {
                    log(this.logDiv, "delete task <id>", task.id, "<name>", task.name)
                    const ta = new Task(task)
                    await ta.delete()
                    resolve(["OK", task.name, task.id])
                })
                taskDeletePromises.push(taskDelete)
            })
        })
        let taskPromises = await Promise.all(taskDeletePromises)
        console.log("doCleanup() <taskPromises>", taskPromises)

        const swimlaneDeletePromises = []
        Object.entries(project.swimlanes).forEach(([sKey, swimlane]) => {
            log(this.logDiv, "delete swimlane <id>", swimlane.id, "<name> ", swimlane.name)
            const swDelete = new Promise(async (resolve, reject) => {
                const sw = new Swimlane(swimlane)
                await sw.delete()
                resolve(["OK", swimlane.name, sw.id])
            })
            swimlaneDeletePromises.push(swDelete)
        })
        let swimlanePromises = await Promise.all(swimlaneDeletePromises)
        console.log("doCleanup() <swimlanePromises>", swimlanePromises)

        const columnDeletePromises = []
        Object.entries(project.columns).forEach(([sKey, column]) => {
            log(this.logDiv, "delete column <id>", column.id, "<name> ", column.name)
            const coDelete = new Promise(async (resolve, reject) => {
                const co = new Column(column)
                await co.delete()
                resolve(["OK", column.name, co.id])
            })
            columnDeletePromises.push(coDelete)
        })

        let columnPromises = await Promise.all(columnDeletePromises)
        console.log("doCleanup() <columnPromises>", columnPromises)

        log(this.logDiv, "delete project <id>", project.id, "<name> ", project.name)
        const pr = new Project(project)
        await pr.delete()



        const projectDeletedEvent = new CustomEvent("projectDeleted", {
            detail: { projectId: pr.getId() },
            bubbles: true,
            cancelable: true,
            composed: true
        })
        //document.querySelectorAll(".projectCreated").dispatchEvent(projectCreatedEvent)
        console.log("doCleanup() over")

        Kontext.resetKanbearJsonBulkData()
        return (true)
        //document.dispatchEvent(projectDeletedEvent)
    }

}
export { KanbearProjectCleanor }
