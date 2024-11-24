import React, { useState, useContext } from 'react';
import { Modal, Button, TextField, Typography, useTheme } from '@mui/material';
import ServiceContext from '../context/ServiceContext';
import { useUser } from '../context/UserContext';

function ServiceModal({ open, handleClose }) {
    const [name, setName] = useState('');
    const [localIP, setLocalIP] = useState('');
    const [publicIP, setPublicIP] = useState('');
    const theme = useTheme();
    const { addService } = useContext(ServiceContext);
    const { user } = useUser();
    const serviceOwner = user ? user.username : "votre_service_owner";

    const handleSubmit = (event) => {
        event.preventDefault();
        const serviceData = { 
            service_owner: serviceOwner,
            name, 
            public_ip: publicIP,
            private_ip: localIP
        };

        console.log("Données du service à envoyer:", serviceData);
        
        if (!serviceData.service_owner || !serviceData.name || !serviceData.public_ip || !serviceData.private_ip) {
            console.error("Tous les champs doivent être remplis.");
            return;
        }

        addService(serviceData);
        
        // Réinitialiser les champs de texte
        setName('');
        setLocalIP('');
        setPublicIP('');
        
        handleClose();
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}>
                <div style={{
                    backgroundColor: theme.palette.background.default,
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    width: '400px',
                }}>
                    <Typography variant="h6" style={{ opacity: 0.8, marginBottom: 10 }}>Ajouter un Service</Typography>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <TextField
                            label="Nom"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            fullWidth
                            required
                            sx={{ marginBottom: 2 }}
                        />
                        <TextField
                            label="IP Locale"
                            value={localIP}
                            onChange={(e) => setLocalIP(e.target.value)}
                            fullWidth
                            required
                            sx={{ marginBottom: 2 }}
                        />
                        <TextField
                            label="IP Publique"
                            value={publicIP}
                            onChange={(e) => setPublicIP(e.target.value)}
                            fullWidth
                            required
                            sx={{ marginBottom: 2 }}
                        />
                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                            <Button type="submit" variant="contained" color="primary">
                                Ajouter
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    );
}

export default ServiceModal;
