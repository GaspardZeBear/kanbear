// src/api.js
import axios from 'axios';
import { Kontext } from './Kontext.mjs'
import { jwtDecode } from 'jwt-decode';
import { Konsol } from 'konsol';

//-----------------------------------------------------------------
class AxiosInstance {
    constructor(url, tokensManager) {
        console.log("AxiosInstance constructor()")
        this.axiosInstance = axios.create({
            baseURL: url,
            timeout: 3000
        });
        this.isRefreshing = false;
        this.tokensManager = tokensManager
        this.failedQueue = [];
        this._initInterceptors();
        console.log("AxiosInstance constructor() over")
    }

    //------------------------------------------------------------------------------------
    _initInterceptors() {
        // Intercepteur de Requête : Injection dynamique du token actuel
        this.axiosInstance.interceptors.request.use(
            (config) => {
                console.log("MyAxiosInstance request interceptor fired ");
                if (this.tokensManager.getAccessToken()) {
                    config.headers.Authorization = `Bearer ${this.tokensManager.getAccessToken()}`;
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
                            .then(() => {
                                //console.log("Promise Interceptor token ", token)
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
                        const data = await this.tokensManager.handleRefreshToken();
                        this.processQueue(null);
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
    processQueue(error) {
        console.log("AxiosInstance processQueue() error", error)
        this.failedQueue.forEach(prom => {
            if (error) {
                prom.reject(error);
            } else {
                console.log("AxiosInstance processQueue()  resolve ")
                prom.resolve();
            }
        });

        if (this.failedQueue.length > 0) {
            log(`AxiosInstance processQueue()  Emptied (${this.failedQueue.length} requests replayed with new token).`);
        }
        this.failedQueue = [];
    }

    //------------------------------------------------------------------------------------------------------------------
    getInstance() {
        return this.axiosInstance;
    }

    //-----------------------------------------------------------------------------------------------------------------------
    get(url, config = {}) {
        return this.axiosInstance.get(url, config);
    }
}

// Exporte l'instance configurée
export { AxiosInstance };