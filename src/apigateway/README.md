# hints

## transform export (ejs) en import/export (mjs)

sed -i.bak 's/exports./  /' workspaces.mjs

sed -i.bak "s@const db = require('../config/database');@import { db } from '../config/database.mjs'@" assignee.mjs

sed -i.bak2 -E 's/module\.exports =(.*);/export { \1 } /g' column.mjs

