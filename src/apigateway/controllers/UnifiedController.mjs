import { KanbearRights } from '../classes/KanbearRights.mjs'
import { KanbearRightsChecker } from '../classes/KanbearRightsChecker.mjs'
import { UnifiedModel } from '../models/UnifiedModel.mjs'
//import { Konsol } from '../classes/Konsol.mjs'
import { Konsol } from 'konsol'

//------------------------------------------------------------------------
// Class to avoid having lots of individual controllers that have the same look
// to be called at route level
// ------------------------------------------------------------------------

class UnifiedController {

    //--------------------------------------------------------------
    // Return the function that will be fired when route activated by a request
    // When fired, the returned function will call the UnifiedModel function that executes the SQL sttament
    //----------------------------------------------------------------------
    static getFunction(table, op, opParms={}) {
        Konsol.log("UnifiedController.getFunction called", table, op)
        return (
            (req, res) => {
                //console.log("---------------------------------------------------------------------")
                Konsol.log("UnifiedController decorated function fired",
                    "table=", table, 
                    "op=", op, 
                    "req.body=", req.body,
                    "req.params=", req.params,
                    "req.query=", req.query,
                    "kanbearKontext=",req.kanbearKontext
                )
                //Konsol.log("UnifiedController callback fired table=", table, "op=", op, "req.params=", req.params)
                //Konsol.log("UnifiedController callback fired table=", table, "op=", op, "req.query=", req.query)
                
                //let isAllowed=new KanbearRightsChecker().isAllowed(table,op,entityId,req.kanbearKontext.rights)
                let krc=new KanbearRightsChecker()
                let isAllowed=krc.isAllowed(table,op,req)
                if ( !isAllowed ) {
                    res.status(403).json({error:"Access denied"});
                }


                UnifiedModel[op](table, req, opParms, (err, httpCode, sqlRes) => {
                    Konsol.log(`UnifiedModel ${op}_${table}() callback function,'<err>`, err, '<sqlRes>', sqlRes)
                    if (err) {
                        Konsol.log(`UnifiedModel ${op}_${table}() callback function,'<err>`, JSON.stringify(err.message))
                        //return res.status(httpCode).json({ error: JSON.stringify(err.message) });
                        //return res.status(httpCode).json(JSON.stringify(err.message));
                        return res.status(httpCode).json(err.message)
                    }
                    res.status(httpCode).json(sqlRes);
                }

                )
            }
        )
    }

}

export { UnifiedController }