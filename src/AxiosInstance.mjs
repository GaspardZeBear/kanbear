//import { axios } from 'axios'
import axios from 'https://esm.sh/axios';

// ==========================================
// 1. CLASSE AXIOS INSTANCE AVEC GESTION REFRESH
// ==========================================
class MyAxiosInstance {
    constructor(url,tokens) {
        log("MyAxiosInstace constructor()")
        this.axiosInstance = axios.create({
            baseURL: url,
            timeout: 3000
        });
        this.isRefreshing = false;
        this.tokens = tokens
        this.failedQueue = [];
        this._initInterceptors();
        log("MyAxiosInstance constructor() over")
    }

    _initInterceptors() {
        // Intercepteur de Requête : Injection dynamique du token actuel
        this.axiosInstance.interceptors.request.use(
            (config) => {
                console.log("MyAxiosInstance request interceptor fired _retry", this._retry);
                if (this.tokens.accessToken) {
                    config.headers.Authorization = `Bearer ${this.tokens.accessToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Intercepteur de Réponse : Gestion des erreurs de jeton (401)
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (error.response && error.response.status === 401 && !originalRequest._retry) {
                    if (this.isRefreshing) {
                        console.log("Interceptor 401 detected refresh already in progress, queuing request.");
                        return new Promise((resolve, reject) => {
                            console.log("Promise returned");
                            this.failedQueue.push({ resolve, reject });
                        })
                            .then(token => {
                                console.log("Promise Interceptor token ", token)
                                //originalRequest.headers.Authorization = `Bearer ${token}`;
                                return this.axiosInstance(originalRequest);
                            })
                            .catch(err => {
                                console.log("Promise Interceptor err ", err)
                                Promise.reject(err)
                            });
                    }
                    originalRequest._retry = true;
                    this.isRefreshing = true;
                    console.log("MyAxiosInstance response  401 détecté ! Lancement du Refresh Token...");
                    try {
                        const data = await this.tokens.handleRefreshToken();

                        this.processQueue(null, tokens.accessToken);
                        //originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
                        return this.axiosInstance(originalRequest);
                    } catch (refreshError) {
                        this.processQueue(refreshError, null);
                        return Promise.reject(refreshError);
                    } finally {
                        this.isRefreshing = false;
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    //-------------------------------------------------------------------------------------------
    processQueue(error, token = null) {
        console.log("processQueue() error", error, " token", token)
        this.failedQueue.forEach(prom => {
            if (error) {
                prom.reject(error);
            } else {
                console.log("processQueue() resolve token", token)
                prom.resolve(token);
            }
        });

        if (this.failedQueue.length > 0) {
            log(`Queue Emptied (${this.failedQueue.length} requests replayed with new token).`);
        }
        this.failedQueue = [];
    }

    //-----------------------------------------------------------------------------------------------------------------------
    get(url, config = {}) {
        return this.axiosInstance.get(url, config);
    }
}

//-----------------------------------------------------------------------------------------------------------------
class Tokens {
    constructor(url, accessToken, refreshToken) {
        this.url = url
        this.accessToken = accessToken
        this.refreshError = refreshToken
    }

    //-------------------------------------------------------------------------------------------------------------------
    setAccessToken(accessToken) {
        this.accessToken = accessToken
    }

    //-------------------------------------------------------------------------------------------------------------------
    getAccessToken() {
        this.accessToken = accessToken
    }
    
    //-------------------------------------------------------------------------------------------------------------------
    setRefreshToken(refreshToken) {
        this.refreshToken = refreshToken
    }

    //-------------------------------------------------------------------------------------------------------------------
    getRefreshToken() {
        this.refreshToken = refreshToken
    }


    //---------------------------------------------------------------------------------------------------------------------
    async handleRefreshToken() {
        console.log("handleRefreshToken() ");
        if (this.refreshToken) {
            //console.log("MyAxiosInstance handleRefreshToken() refreshToken exists")
            //console.log("MyAxiosInstance response  handleRefreshToken()", tokens);
            const response = await axios.post(this.url,
                { refreshToken: this.refreshToken, sleep: 0 }
            )
            //console.log("MyAxiosInstance handleRefreshToken()", response)
            this.accessToken = response.data.accessToken
            //console.log("MyAxiosInstance response  handleRefreshToken() token updated", tokens);
            console.log("MyAxiosInstance response  handleRefreshToken() token updated");
            return
        } else {
            throw (Error('No refresh token'))
        }
    }
}

//==================================================================================
console.log("starting")
// --- Variables globales ---
const URL = "http://localhost:3002"
const USER = {
    name: "aaa",
    password: "aaa"
}
const REFRESH_URL = `${URL}/api/auth/refresh`
const LOGIN_URL = `${URL}/api/login`
const ENDPOINT0 = "/api/projects/1"
const ENDPOINT1 = "/api/workspaces/1"
const SLEEP0 = 2000
const SLEEP1 = 5000

let tokens = new Tokens(REFRESH_URL, null, null)
let intervalId0, intervalId1

// Injection de logs visuels dans le HTML
const logBox = document.getElementById('logBox');
function log(message) {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    const msg = `[${timestamp}] ${message}<br>`;
    logBox.innerHTML += msg
    console.log(msg)
    logBox.scrollTop = logBox.scrollHeight;
}

const myApi = new MyAxiosInstance(URL,tokens);

document.getElementById('startBtn').addEventListener('click', async (e) => {
    e.target.disabled = true; // Désactive le bouton pour éviter les doubles clics de boucle
    document.getElementById('stopBtn').disabled = false
    let response = await login(USER)
    tokens.setAccessToken(response.token)
    tokens.setRefreshToken (response.refreshToken)
    intervalId0 = setInterval(() => {
        log(`main calling ${ENDPOINT0}`);
        callEndpoint(ENDPOINT0);
    }, SLEEP0);
    intervalId1 = setInterval(() => {
        log(`main calling ${ENDPOINT1}`);
        callEndpoint(ENDPOINT1);
    }, SLEEP1);
});

document.getElementById('stopBtn').addEventListener('click', async (e) => {
    document.getElementById('startBtn').disabled = false
    e.target.disabled = true;
    clearInterval(intervalId0)
    clearInterval(intervalId1)
})

document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
        // Vérifier le token et rafraîchir si nécessaire
        //verifierEtRafraichirToken();
        console.log("visibilty change listener ")
        await tokens.handleRefreshToken()
    }
});

//----------------------------------------------------------------------------------------------
async function login(user) {
    const response = await axios.post(LOGIN_URL, { userName: user.name, userPassword: user.password })
    const { data } = response
    let tokens = {
        accessToken: data.token,
        refreshToken: data.refreshToken
    }
    console.log("login() tokens ", tokens)
    return(tokens)
}

//---------------------------------------------------------------------------------------------
async function callEndpoint(endpoint) {
    try {
        log(`Envoi d'une requête GET ${endpoint}`);
        const start = new Date()
        const response = await myApi.get(endpoint);
        const end = new Date()
        log(`🟢 Success ! ${endpoint} : ${response.data} latency ${end.getTime() - start.getTime()}`);
    } catch (err) {
        log(`🔴 Failing request ${endpoint} : ${err.message}`);
    }
}
