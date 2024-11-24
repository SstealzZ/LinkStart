import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import CopyIcon from '@mui/icons-material/FileCopy';
import ArrowIcon from '@mui/icons-material/ArrowForward';

const GenerateIP = ({ ip, Icon }) => {
    const style = {
        customBox: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between', // Permet d'espacer le contenu
            borderTop: '1px solid #ccc',
            borderBottom: '1px solid #ccc',
            padding: '4px 2px',
        },
        leftSection: {
            display: 'flex',
            alignItems: 'center',
        },
        buttonGroup: {
            display: 'flex',
            alignItems: 'center',
            gap: '4px', // Ajoute un espace entre les boutons
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

    return (
        <Box sx={style.customBox}>
            <Box sx={style.leftSection}>
                <Icon style={{ marginRight: 4, fontSize: '0.9rem' }} />
                <Typography variant="body1" sx={{ fontSize: '0.8rem' }}>{ip}</Typography>
            </Box>
            <Box sx={style.buttonGroup}>
                <CopyToClipboard text={ip} onCopy={() => { /* alert('IP copiée !'); */ }}>
                    <Button variant="outlined" sx={style.copyButton}>
                        <CopyIcon sx={style.copyIcon} />
                    </Button>
                </CopyToClipboard>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => window.open(`http://${ip}`, '_blank')}
                    sx={style.copyButton}
                >
                    <ArrowIcon sx={style.copyIcon} />
                </Button>
            </Box>
        </Box>
    );
};

export default GenerateIP;
