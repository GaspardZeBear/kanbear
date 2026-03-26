import { KanboardFilter } from "./KanboardFilter.mjs"
import { formatDuration, dateToString, getDurationFromNow } from "../utils/formatDuration.mjs";
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

class KanbearProjectCleanor {
    constructor(element, filtersMap) {
        //this.project = Kontext.getCurrentProject()
        this.htmlElement = element
        this.kanboardFilter = new KanboardFilter(filtersMap)
        this.buttons = {}
        this.table = undefined
        let resultTitle = document.createElement('h2')
        resultTitle.innerHTML = `Cleaning project `
        document.getElementById(this.htmlElement).replaceChildren(resultTitle)
        //cleanup(Kontext.getCurrentProject())
    }

    //-----------------------------------------------------------------------------------
    cleanup() {
        this.doCleanup(Kontext.getCurrentProject())
    }
    //-----------------------------------------------------------------------------------
    // Cleanup all the tasks in swimlanes
    // then remove columns and swimlanes
    // then remove project
    async doCleanup(project) {
        let logDiv = document.createElement("ul")

        Object.entries(project.swimlanes).forEach(([sKey, swimlane]) => {
            log(logDiv, "tasks in  swimlane ", swimlane.name)
            Object.entries(swimlane.tasks).forEach(([tKey, task]) => {
                log(logDiv, "delete task <id>", task.id, "<name>", task.name)
                const ta=new Task(task)
                ta.delete()
            })
        })

        Object.entries(project.swimlanes).forEach(([sKey, swimlane]) => {
            log(logDiv, "delete swimlane <id>", swimlane.id , "<name> " ,swimlane.name)
        })

        Object.entries(project.columns).forEach(async ([sKey, column]) => {
            log(logDiv, "delete column <id>", column.id , "<name> ", column.name)
            const co = new Column(column)
            co.delete()
        })

         log(logDiv, "delete project <id>", project.id , "<name> ", project.name)
        const pr=new Project(project)
        pr.delete()


        document.getElementById(this.htmlElement).appendChild(logDiv)
    }

}
export { KanbearProjectCleanor }
