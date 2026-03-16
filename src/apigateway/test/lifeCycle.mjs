import { Entity } from "./Entity.mjs"
//----------------------------------------------------------------------------------

let ws=new Entity("workspaces")
await ws.create()
await ws.alter()
await ws.list()
//ws.erase()

