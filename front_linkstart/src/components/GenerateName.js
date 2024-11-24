import React, { useContext, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import TrashIcon from '@mui/icons-material/Delete';
import ServiceContext from '../context/ServiceContext';

const GenerateName = ({ name, serviceId }) => {
    const { autoriseServiceDelete, deleteService } = useContext(ServiceContext);
    const [isDeleting, setIsDeleting] = useState(false);

    const style = {
        customBox: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 2px',
        },
        leftSection: {
            display: 'flex',
            alignItems: 'center',
        },
        buttonGroup: {
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
        },
        copyIcon: {
            fontSize: '0.8rem',
        },
        copyButton: {
            padding: '2px',
            minWidth: 0,
            minHeight: 0,
            width: 20,
            height: 20,
            borderRadius: '4px',
        },
    };

    const handleDelete = async () => {
        if (!serviceId) {
            console.error("ID du service manquant");
            return;
        }
        
        try {
            setIsDeleting(true);
            console.log("Suppression du service avec l'ID:", serviceId);
            await deleteService(serviceId);
            console.log("Service supprimé avec succès");
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
            alert("Erreur lors de la suppression du service");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Box sx={style.customBox}>
            <Box sx={style.leftSection}>
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>{name}</Typography>
            </Box>
            <Box sx={style.buttonGroup}>
                {autoriseServiceDelete && (
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        sx={style.copyButton}
                    >
                        <TrashIcon sx={style.copyIcon} />
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default GenerateName; 