import { UnifiedModel } from '../models/UnifiedModel.mjs'

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
        console.log("UnifiedController.getFunction called", table, op)
        return (
            (req, res) => {
                console.log("UnifiedController callback fired table=", table, "op=", op, "req.body=", req.body)
                console.log("UnifiedController callback fired table=", table, "op=", op, "req.params=", req.params)
                UnifiedModel[op](table, req.params, req.body, opParms, (err, httpCode, params) => {
                    console.log(`UnifiedModel workspaces.${op}_${table}() callback function err`, err, 'params (result)', 'params')
                    if (err) {
                        return res.status(httpCode).json({ error: err.message });
                    }
                    res.status(httpCode).json(params);
                }

                )
            }
        )
    }

}

export { UnifiedController }