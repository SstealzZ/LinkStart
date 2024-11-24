import React, { createContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';
import axios from 'axios';

const ServiceContext = createContext();

export const ServiceProvider = ({ children }) => {
    const userContext = useUser();
    const [services, setServices] = useState([]);
    const [onlineServiceCount, setOnlineServiceCount] = useState(0);
    const [autoriseServiceDelete, setAutoriseServiceDelete] = useState(false);
    const [canIncrementOnlineServiceCount, setCanIncrementOnlineServiceCount] = useState(true);

    const token = userContext?.token;
    const isLoading = userContext?.loading;

    // Fetch all services
    const fetchServices = async () => {
        if (!token) {
            return;
        }
        try {
            const response = await axios.get('/services', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setServices(response.data);
            setOnlineServiceCount(0); // Reset online count on services fetch
        } catch (error) {
            if (error.response?.status === 401 && error.response?.data?.detail === 'Token expired') {
                try {
                    const newToken = await userContext.refreshToken();
                    const retryResponse = await axios.get('/services', {
                        headers: {
                            Authorization: `Bearer ${newToken}`,
                        },
                    });
                    setServices(retryResponse.data);
                    setOnlineServiceCount(0); // Reset online count on services fetch
                } catch (refreshError) {
                }
            }
        }
    };

    // Add a new service
    const addService = async (service) => {
        if (!token) {
            return;
        }
        try {
            const response = await axios.post('/services', service, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            
            // Vérifier que l'ID est présent dans la réponse
            if (!response.data.id) {
            }
            
            // Ajouter le service avec son ID à l'état
            setServices((prevServices) => [...prevServices, response.data]);
            
            return response.data;
        } catch (error) {
        }
    };

    // Autorise service delete
    const enableServiceDelete = () => {
        setAutoriseServiceDelete(true);
    };

    // Disable service delete
    const disableServiceDelete = () => {
        setAutoriseServiceDelete(false);
    };
    
    // Increment online service count
    const incrementOnlineServiceCount = () => {
        if (canIncrementOnlineServiceCount) {
            setOnlineServiceCount((prevCount) => prevCount + 1);
        }
    };

    // Disable increment online service count
    const disableIncrementOnlineServiceCount = () => {
        setCanIncrementOnlineServiceCount(false);
    };

    // Reset online service count
    const resetOnlineServiceCount = () => {
        setOnlineServiceCount(0);
    };

    // Count total services
    const countServices = () => services.length;

    // Clear services and reset state
    const clearServices = () => {
        setServices([]);
        setOnlineServiceCount(0);
    };

    // Ajouter cette nouvelle fonction dans ServiceProvider
    const deleteService = async (serviceId) => {
        if (!token) {
            return;
        }
        
        try {
            const response = await axios.delete(`/services/${serviceId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            if (response.status === 200) {
                setServices((prevServices) => 
                    prevServices.filter(service => service.id !== serviceId)
                );
            }
        } catch (error) {
            if (error.response?.status === 401 && error.response?.data?.detail === 'Token expired') {
                try {
                    const newToken = await userContext.refreshToken();
                    const retryResponse = await axios.delete(`/services/${serviceId}`, {
                        headers: {
                            Authorization: `Bearer ${newToken}`,
                        },
                    });
                    
                    if (retryResponse.status === 200) {
                        setServices((prevServices) => 
                            prevServices.filter(service => service.id !== serviceId)
                        );
                    }
                } catch (refreshError) {
                    throw refreshError;
                }
            } else {
                throw error;
            }
        }
    };

    // Fetch services when the context initializes
    useEffect(() => {
        if (!isLoading && token) {
            fetchServices();
        }
    }, [isLoading, token]);

    return (
        <ServiceContext.Provider
            value={{
                services,
                addService,
                deleteService,
                onlineServiceCount,
                incrementOnlineServiceCount,
                disableIncrementOnlineServiceCount,
                resetOnlineServiceCount,
                countServices,
                clearServices,
                autoriseServiceDelete,
                enableServiceDelete,
                disableServiceDelete,
            }}
        >
            {isLoading ? <div>Loading...</div> : children}
        </ServiceContext.Provider>
    );
};

export default ServiceContext;
