
import { Konsol } from 'konsol'
import jwt from 'jsonwebtoken'


class KanbearTokens {

    constructor(params) {
        Konsol.log("KanbearTokens.constructor()", "params", params)
    }

    //--------------------------------------------------------------------------------------
    generateToken(userInfos) {
        Konsol.log("AccessTokens generateToken() userInfos", userInfos)
        const token = jwt.sign(
            userInfos,
            'kanbear',
            { expiresIn: '15m' }
        );
        return (token)
    }

    //--------------------------------------------------------------------------------------
    generateRefreshToken(userInfos) {
        const refreshToken = jwt.sign(
            userInfos,
            'kanbear',
            { expiresIn: '1h' }
        );
        return (refreshToken)
    }
    //-----------------------------------------------------
    checkToken(token) {
        //await sleep(2500)
        Konsol.log("AccessTokens checkToken() will check", "token", token)
        if (!token) {
            //this.res.status(401).json({ message: 'No token' });
            throw Error("No token")
        }
        try {
            this.decodedToken = jwt.verify(token, 'kanbear')
            return (this.decodedToken)
        } catch (e) {
            console.log(e)
            Konsol.log("AccessRights check()", "error", e)
            //this.res.status(401).json({ message: 'Token invalide.' });
            throw Error("Invalid token", { cause: "Invalid token" })
        }
    }
}

export { KanbearTokens }
