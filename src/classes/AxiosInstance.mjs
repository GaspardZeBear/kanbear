// src/api.js
import axios from 'axios';

class AxiosInstance {
    // Crée une instance Axios avec une configuration de base

    constructor(url) {
        console.log("AxiosInstance constructor", "url", url)
        this.instance = axios.create({
            baseURL: url, // Remplace par l'URL de ton API
            timeout: 5000, // Timeout en ms
        });

        // Ajoute un intercepteur pour les réponses
        this.instance.interceptors.response.use(
            (response) => {
                // Si la réponse est OK, retourne-la directement
                console.log("AxiosInstance ok")
                return response;
            },
            (error) => {
                console.log("AxiosInstance error")
                if (error.response) {
                    // Cas d'une erreur 401 (Unauthorized)
                    if (error.response.status === 401) {
                        // Gère l'erreur 401 ici
                        this.handleUnauthorizedError(error);
                    }
                    // Pour les autres erreurs (404, 500, etc.), retourne l'erreur
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
        console.log("AxiosInstance handleUnauthorizedError", error)
        // Exemple 1 : Rediriger vers la page de login
        //window.location.href = '/login?from=' + encodeURIComponent(window.location.pathname);

        // Exemple 2 : Afficher un message d'erreur (avec un toast, par exemple)
        //alert('Votre session a expiré. Veuillez vous reconnecter.');

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