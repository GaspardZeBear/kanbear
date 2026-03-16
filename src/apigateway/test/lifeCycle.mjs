import { Entity } from "./Entity.mjs"
//----------------------------------------------------------------------------------

let ws=new Entity("workspaces")
await ws.create()
await ws.alter()
await ws.list()
let pr=new Entity("projects")
await pr.create({"workspace_id": await ws.getId()})
await pr.alter()
await pr.list()
let sw=new Entity("swimlanes")
await sw.create({project_id:await pr.getId()})
//ws.erase()

