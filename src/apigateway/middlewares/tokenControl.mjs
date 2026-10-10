import { Konsol } from 'konsol'
import { KanbearTokens } from '../classes/KanbearTokens.mjs'

//------------------------------------------------------------------------------------------------
async function controlToken(req, res, next) {
    Konsol.log("controlToken() begin")
    try {
        const token = req.headers['authorization'].split(' ')[1];
        let decodedToken = new KanbearTokens().checkToken(token)
        req.kanbearKontext = {
            decodedToken: decodedToken,
        }
        next()
    } catch (err) {
        console.log(err)
        Konsol.log('controlToken error', err);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Error when checking token.'
        });
    }
}


//--------------------------------------------------------------------------------------------------
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export { controlToken }