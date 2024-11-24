import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography } from '@mui/material';
import { useUser } from '../context/UserContext';
import ServiceContext from '../context/ServiceContext';

const WebsiteStatus = ({ ip }) => {
    const { pingIP } = useUser();
    const { incrementOnlineServiceCount, disableIncrementOnlineServiceCount } = useContext(ServiceContext);
    const [status, setStatus] = useState('checking');

    // Extract base IP
    const extractBaseIP = (ip) => {
        try {
            const url = new URL(`http://${ip}`);
            return url.hostname;
        } catch (error) {
            return ip.split(':')[0].split('/')[0];
        }
    };

    const filteredIP = extractBaseIP(ip);

    useEffect(() => {
        let isMounted = true; // Guard to ensure the state updates only when mounted

        const checkWebsiteStatus = async () => {
            try {
                const response = await pingIP(filteredIP);
                if (isMounted) {
                    const isActive = response.reachable;
                    setStatus(isActive ? 'active' : 'inactive');
                    if (isActive) {
                        incrementOnlineServiceCount(); // Increment count only once
                    } else {
                        disableIncrementOnlineServiceCount(); // Si tous les services ont été vérifiés, désactivez l'incrémentation
                    }
                }
            } catch (error) {
                if (isMounted) {
                    setStatus('inactive'); // Set as inactive if an error occurs
                }
            }
        };

        checkWebsiteStatus();

        // Cleanup function to prevent state updates after unmount
        return () => {
            isMounted = false;
        };
    }, []); // Empty dependency array ensures it runs only once on mount

    const style = {
        led: {
            width: 14,
            height: 14,
            borderRadius: '50%',
            backgroundColor: status === 'active' ? '#4caf50' : '#f44336',
        },
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
            <Box sx={style.led} />
            <Typography variant="body2" sx={{ marginLeft: 1 }}>
                {status === 'checking' ? 'Checking...' : status === 'active' ? 'Active' : 'Inactive'}
            </Typography>
        </Box>
    );
};

export default WebsiteStatus;
