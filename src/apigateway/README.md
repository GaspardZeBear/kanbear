# hints

## transform export (ejs) en import/export (mjs)

sed -i.bak 's/exports./  /' workspaces.mjs

sed -i.bak "s@const db = require('../config/database');@import { db } from '../config/database.mjs'@" assignee.mjs

sed -i.bak2 -E 's/module\.exports =(.*);/export { \1 } /g' column.mjs


curl http://A6.mshome.net:3002/api/workspaces
curl http://A6.mshome.net:3002/api/workspaces/1

curl -X POST -H  "Content-Type: application/json" -d '{"name":"ws2","is_open":8}' http://A6.mshome.net:3002/api/workspaces/
curl -X PUT -H  "Content-Type: application/json" -d '{"name":"ws","is_open":1}' http://A6.mshome.net:3002/api/workspaces/37
curl -X PATCH -H  "Content-Type: application/json" -d '{"name":"wsxxx"}' http://A6.mshome.net:3002/api/workspaces/37
curl -X DELETE -vvv -H  "Content-Type: application/json"  http://A6.mshome.net:3002/api/workspaces/3



~/sqlite3/sqlite3 kanban.db


## Complete test

rm kanban.db
nodemon app.mjs
node init_db.mjs
sqlite3 kanban.db .schema

curl -X POST -H  "Content-Type: application/json" -d '{"name":"W1","is_open":1}' http://A6.mshome.net:3002/api/workspaces/
curl -X POST -H  "Content-Type: application/json" -d '{"name":"P1","workspace_id":1}' http://A6.mshome.net:3002/api/projects/
curl -X POST -H  "Content-Type: application/json" -d '{"name":"S1","project_id":1}' http://A6.mshome.net:3002/api/swimlanes/
curl -X PATCH -H  "Content-Type: application/json" -d '{"name":"Project1"}' http://A6.mshome.net:3002/api/projects/1
curl -X PATCH -H  "Content-Type: application/json" -d '{"name":"Workspace1"}' http://A6.mshome.net:3002/api/workspaces/1
curl -X PATCH -H  "Content-Type: application/json" -d '{"name":"Swimlane1"}' http://A6.mshome.net:3002/api/swimlanes/1
curl  http://A6.mshome.net:3002/api/workspaces
curl  http://A6.mshome.net:3002/api/workspaces/1
curl  http://A6.mshome.net:3002/api/projects
curl  http://A6.mshome.net:3002/api/projects/1
curl  http://A6.mshome.net:3002/api/swimlanes
curl  http://A6.mshome.net:3002/api/swimlanes/1
curl  http://A6.mshome.net:3002/api/swimlanes/project/1
curl -X DELETE  http://A6.mshome.net:3002/api/swimlanes/1
curl -X DELETE  http://A6.mshome.net:3002/api/projects/1
curl -X DELETE  http://A6.mshome.net:3002/api/workspaces/1


