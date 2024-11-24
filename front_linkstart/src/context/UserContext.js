import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Set up Axios base URL
axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setToken(parsedUser.token);
            setIsAuthenticated(true);
            axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        console.log('Tentative de connexion avec:', { username, password });
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('username', username);
            params.append('password', password);
            
            const response = await axios.post(process.env.REACT_APP_AUTH_LOGIN_ENDPOINT, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

            console.log('Réponse de connexion:', response.data);
            const { access_token } = response.data;
            const userResponse = await axios.get(process.env.REACT_APP_AUTH_ME_ENDPOINT, {
                headers: { Authorization: `Bearer ${access_token}` },
            });
            const userData = userResponse.data;
    
            const userWithToken = { ...userData, token: access_token };
            setUser(userWithToken);
            setToken(access_token);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(userWithToken));
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    
            return true;
        } catch (err) {
            console.error('Erreur de connexion:', err);
            setIsAuthenticated(false);
            return false;
        } finally {
            setLoading(false);
        }
    };
    

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
    };

    const register = async (username, email, password) => {
        console.log('Tentative d\'inscription avec:', { username, email, password });
        setLoading(true);
        try {
            const response = await axios.post(process.env.REACT_APP_AUTH_REGISTER_ENDPOINT, {
                username,
                email,
                password,
            });
            console.log('Réponse d\'inscription:', response.data);
            const { access_token } = response.data;

            const userResponse = await axios.get(process.env.REACT_APP_AUTH_ME_ENDPOINT, {
                headers: { Authorization: `Bearer ${access_token}` },
            });
            const userData = userResponse.data;

            const userWithToken = { ...userData, token: access_token };
            setUser(userWithToken);
            setToken(access_token);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(userWithToken));

            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

            return true;
        } catch (err) {
            console.error('Erreur d\'inscription:', err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const refreshToken = async () => {
        try {
            const storedUser = localStorage.getItem('user');
            if (!storedUser) throw new Error("No user found in localStorage");

            const { refresh_token } = JSON.parse(storedUser);

            const response = await axios.post(process.env.REACT_APP_AUTH_REFRESH_ENDPOINT, { refresh_token });
            const { access_token } = response.data;

            setToken(access_token);
            setUser((prevUser) => ({ ...prevUser, token: access_token }));
            localStorage.setItem(
                'user',
                JSON.stringify({ ...JSON.parse(storedUser), token: access_token })
            );

            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
            return access_token;
        } catch (error) {
            console.error("Failed to refresh token:", error.response?.data || error.message);
            logout();
            throw error;
        }
    };

    const pingIP = async (ip) => {
        try {
            const response = await axios.get(`/ping/${ip}`);
            return response.data;
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

export const useUser = () => useContext(UserContext);
