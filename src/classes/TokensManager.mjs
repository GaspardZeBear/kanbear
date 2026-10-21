import axios from 'axios';
import { Kontext } from './Kontext.mjs'
import { jwtDecode } from 'jwt-decode';

//-----------------------------------------------------------------------------------------------------------------
class TokensManager {
    constructor(refreshUrl, accessToken, refreshToken, accessTokenCallback = null) {
        console.log("TokensManager constructor() refreshUrl",refreshUrl)
        this.refreshUrl = refreshUrl
        if (accessToken) {
            this.setAccessToken(accessToken)
        } else {
            this.accessToken = null
            this.decodedAccessToken = null
        }
        this.accessTokenCallBack = accessTokenCallback
        this.refreshError = refreshToken
    }

    //-------------------------------------------------------------------------------------------------------------------
    setAccessToken(accessToken) {
        this.accessToken = accessToken
        this.decodedAccessToken = jwtDecode(this.accessToken)
        if (this.accessTokenCallBack) {
            this.accessTokenCallBack(this.decodedAccessToken)
        }
    }

    //-------------------------------------------------------------------------------------------------------------------
    getAccessToken() {
        return (this.accessToken)
    }

    //-------------------------------------------------------------------------------------------------------------------
    getDecodedAccessToken() {
        return (this.decodedAccessToken)
    }


    //-------------------------------------------------------------------------------------------------------------------
    setRefreshToken(refreshToken) {
        this.refreshToken = refreshToken
    }

    //-------------------------------------------------------------------------------------------------------------------
    getRefreshToken() {
        return (this.refreshToken)
    }


    //---------------------------------------------------------------------------------------------------------------------
    async handleRefreshToken() {
        console.log("handleRefreshToken() ");
        if (this.refreshToken) {
            //console.log("MyAxiosInstance handleRefreshToken() refreshToken exists")
            //console.log("MyAxiosInstance response  handleRefreshToken()", tokens);
            const response = await axios.post(this.refreshUrl,
                { refreshToken: this.refreshToken, sleep: 0 }
            )
            //console.log("MyAxiosInstance handleRefreshToken()", response)
            this.setAccessToken(response.data.accessToken)
            //console.log("MyAxiosInstance response  handleRefreshToken() token updated", tokens);
            console.log("MyAxiosInstance response  handleRefreshToken() token updated");
            return
        } else {
            throw (Error('No refresh token'))
        }
    }
}

export { TokensManager }