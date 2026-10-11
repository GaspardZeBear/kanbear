// src/api.js
import axios from 'axios';
import { Kontext } from './Kontext.mjs'
import { jwtDecode } from 'jwt-decode';
import { Konsol } from 'konsol';

class AxiosInstance {
    // Crée une instance Axios avec une configuration de base

    static isRefreshing = false
    static failedQueue = []

    constructor(url) {
        console.log("AxiosInstance constructor", "url", url)
        this.instance = axios.create({
            baseURL: url, // Remplace par l'URL de ton API
            timeout: 5000, // Timeout en ms
        });

        this.instance.interceptors.request.use(
            (config) => {
                const token = Kontext.getJwtToken()
                if (token) {
                    //config.headers.Authorization = `Bearer ${token}`;
                    config.headers.Authorization = `Bearer ${token}`;
                    config._retry = true
                }
                console.log("AxiosInstance constructor interceptor config", token)
                return (config);
            }
        )

        // Ajoute un intercepteur pour les réponses
        this.instance.interceptors.response.use(
            (response) => {
                // Si la réponse est OK, retourne-la directement
                console.log("AxiosInstance ok")
                return response;
            },
            (error) => {
                console.log("AxiosInstance error ", error)
                if (error.response) {
                    // Cas d'une erreur 401 (Unauthorized)
                    if (error.response.status === 401 || error.response.status === 403) {
                        AxiosInstance.isRefreshing = true
                        this.handleUnauthorizedError(error);
                    }
                    console.log('AxiosInstance on error status', error.response.status);
                    return Promise.reject(error);
                } else if (error.request) {
                    // La requête a été faite mais aucune réponse n'a été reçue
                    console.error('Aucune réponse reçue:', error.request);
                } else {
                    // Une erreur est survenue lors de la configuration de la requête
                    console.error('Erreur de configuration:', error.message);
                }
                return Promise.reject(error);
            }
        );
    }

    // Fonction pour gérer les erreurs 401
    handleUnauthorizedError(error) {
        console.log("AxiosInstance handleUnauthorizedError()", error)
        if (AxiosInstance.isRefreshing) {
            // put the failed request in queur
            console.log("AxiosInstance handleUnauthorizedError() isRefreshing")
            AxiosInstance.failedQueue.push(error.config)
            navigator.locks.request("refreshLock", { mode : 'exclusive' },async (lock) => {
                console.log("AxiosInstance handleUnauthorizedError() lock acquired")
                const refresh = axios.post(`${Kontext.getKanbearUrl()}/api/auth/refresh`, {
                    refreshToken: Kontext.getJwtRefreshToken()
                });
                refresh
                    .then((response) => {
                        const { data } = response
                        console.log("AxiosInstance handleUnauthorizedError() refresh OK", data)
                        let token=data.accessToken
                        let decodedToken = jwtDecode(token)
                        Kontext.setUserName(decodedToken.userName)
                        Kontext.setUserId(decodedToken.userId)
                        Kontext.setUserRights(decodedToken.rights)
                        Kontext.setAdmin(decodedToken.isAdmin)
                        Kontext.setJwtToken(token)
                        /*
                        AxiosInstance.failedQueue.forEach((request) => {
                            if (!request._retry) {
                                request._retry = false
                            } else {
                                request.headers.Authorization = `Bearer ${Kontext.getJwtToken()}`
                                this.instance(request)
                            }
                        });
                        */
                        
                    })
                    .catch((err) => {
                        console.log("AxiosInstance handleUnauthorizedError() refresh KO ",err)
                     })
                    .finally(() => {
                        console.log("AxiosInstance handleUnauthorizedError() refresh finally")
                        AxiosInstance.failedQueue=[]
                     })
            })

        }
        // Exemple 1 : Rediriger vers la page de login
        //window.location.href = '/login?from=' + encodeURIComponent(window.location.pathname);

        // Exemple 2 : Afficher un message d'erreur (avec un toast, par exemple)
        alert(`No authorized ${error}`);

        // Exemple 3 : Rafraîchir le token (si tu utilises JWT)
        // return refreshTokenAndRetry(error);
    }

    // Méthodes HTTP
    getInstance() {
        return this.instance;
    }


}

// Exporte l'instance configurée
export { AxiosInstance };