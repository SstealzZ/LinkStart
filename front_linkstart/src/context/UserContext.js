import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Set up Axios base URL
axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Création du contexte utilisateur
const UserContext = createContext(null);

// Fournisseur du contexte utilisateur
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Données utilisateur
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Statut de connexion
    const [loading, setLoading] = useState(true); // État de chargement pour la restauration
    const [token, setToken] = useState(null); // État pour le token

    // Restore user session on app reload
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setToken(parsedUser.token); // Mise à jour du token
            setIsAuthenticated(true);

            // Set Authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
        } else {
        }
        setLoading(false); // Indiquer que la restauration est terminée
    }, []);

    // Fonction de connexion
    const login = async (username, password) => {
        setLoading(true);
        try {
            // Create URL-encoded form data
            const params = new URLSearchParams();
            params.append('username', username);
            params.append('password', password);
    
            const response = await axios.post(process.env.REACT_APP_AUTH_LOGIN_ENDPOINT, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
    
            const { access_token } = response.data;
    
            // Fetch user details
            const userResponse = await axios.get(process.env.REACT_APP_AUTH_ME_ENDPOINT, {
                headers: { Authorization: `Bearer ${access_token}` },
            });
            const userData = userResponse.data;
    
            // Update user state
            const userWithToken = { ...userData, token: access_token };
            setUser(userWithToken);
            setToken(access_token); // Assurez-vous que le token est bien enregistré
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(userWithToken));
    
            // Set Authorization header for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    
            return true; // Login successful
        } catch (err) {
            console.error('Login error:', err.response?.data?.detail || err.message);
            return false; // Login failed
        } finally {
            setLoading(false);
        }
    };
    

    // Fonction de déconnexion
    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization']; // Remove token
    };

    // Fonction d'inscription
    const register = async (username, email, password) => {
        setLoading(true);
        try {
            const response = await axios.post(process.env.REACT_APP_AUTH_REGISTER_ENDPOINT, {
                username,
                email,
                password,
            });
            const { access_token } = response.data;

            // Fetch user details
            const userResponse = await axios.get(process.env.REACT_APP_AUTH_ME_ENDPOINT, {
                headers: { Authorization: `Bearer ${access_token}` },
            });
            const userData = userResponse.data;

            // Update user state
            const userWithToken = { ...userData, token: access_token };
            setUser(userWithToken);
            setToken(access_token); // Enregistrer le token dans l'état
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(userWithToken));

            // Set Authorization header for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

            return true; // Inscription réussie
        } catch (err) {
            console.error('Erreur d\'inscription:', err.response?.data?.detail || err.message);
            return false; // Inscription échouée
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour rafraîchir le token
    const refreshToken = async () => {
        try {
            const storedUser = localStorage.getItem('user');
            if (!storedUser) throw new Error("No user found in localStorage");

            const { refresh_token } = JSON.parse(storedUser);

            const response = await axios.post(process.env.REACT_APP_AUTH_REFRESH_ENDPOINT, { refresh_token });
            const { access_token } = response.data;

            // Update the token in state and localStorage
            setToken(access_token);
            setUser((prevUser) => ({ ...prevUser, token: access_token }));
            localStorage.setItem(
                'user',
                JSON.stringify({ ...JSON.parse(storedUser), token: access_token })
            );

            // Update Axios headers
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
            return access_token;
        } catch (error) {
            console.error("Failed to refresh token:", error.response?.data || error.message);
            logout(); // Log the user out if refreshing fails
            throw error;
        }
    };

    // Fonction pour pinguer une IP
    const pingIP = async (ip) => {
        try {
            const response = await axios.get(`/ping/${ip}`);
            return response.data; // Exemple : { reachable: true, response_time: 4.5 }
        } catch (error) {
            console.error('Échec du ping :', error.response?.data || error.message);
            return { reachable: false };
        }
    };

    return (
        <UserContext.Provider value={{ 
            user, 
            isAuthenticated, 
            login, 
            logout, 
            register, 
            refreshToken, 
            pingIP,
            loading, 
            token 
        }}>
            {children}
        </UserContext.Provider>
    );
};

// Hook pour utiliser le contexte utilisateur
export const useUser = () => useContext(UserContext);
