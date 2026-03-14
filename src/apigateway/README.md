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


~/sqlite3/sqlite3 kanban.db


