
import { Konsol } from 'konsol'
import jwt from 'jsonwebtoken'


class KanbearTokens {

    constructor(params) {
        Konsol.log("KanbearTokens.constructor()", "params", params)
    }

    //--------------------------------------------------------------------------------------
    generateToken(userInfos) {
        userInfos.kind = "access"
        Konsol.log("KanbearTokens generateToken() userInfos", userInfos)

        const token = jwt.sign(
            userInfos,
            'kanbear',
            { expiresIn: '10s' }
        );
        Konsol.log("KanbearTokens generateToken() access", token)
        return (token)
    }

    //--------------------------------------------------------------------------------------
    generateRefreshToken(userInfos) {
        userInfos.kind = "refresh"
        Konsol.log("KanbearTokens generateRefreshToken() userInfos", userInfos)
        const refreshToken = jwt.sign(
            userInfos,
            'kanbear',
            { expiresIn: '1h' }
        );
        Konsol.log("KanbearTokens generateRefreshToken() refresh", refreshToken)
        return (refreshToken)
    }
    //-----------------------------------------------------
    checkToken(kind, token) {
        //await sleep(2500)
        Konsol.log(`KanbearTokens checkToken() will check ${kind}`, "token", token)
        if (!token) {
            //this.res.status(401).json({ message: 'No token' });
            throw Error("No token")
        }
        try {
            let decodedToken = jwt.verify(token, 'kanbear')
            const iat = decodedToken.iat;
            const dateCreation = new Date(iat * 1000);
            const exp = decodedToken.exp;
            const dateExp = new Date(exp * 1000);

            Konsol.log("checkToken() iat ", dateCreation, "exp", dateExp);
            return (decodedToken)
        } catch (e) {
            console.log(e)
            Konsol.log("KanbearTokens checkToken()", "error", e)
            //this.res.status(401).json({ message: 'Token invalide.' });
            throw Error("Invalid token", { cause: "Invalid token" })
        }
    }
}

export { KanbearTokens }
