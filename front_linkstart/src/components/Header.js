import React, { useContext } from "react";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { useUser } from '../context/UserContext';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ServiceContext from '../context/ServiceContext';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const Header = () => {
    const theme = useTheme();
    const { logout } = useUser();
    const { services, onlineServiceCount, autoriseServiceDelete, enableServiceDelete, disableServiceDelete } = useContext(ServiceContext);

    const totalServices = services.length;

    const handleDeleteClick = () => {
        if (autoriseServiceDelete) {
            disableServiceDelete();
        } else {
            enableServiceDelete();
        }
    };

    const style = {
        customizeToolbar: {
            minHeight: "48px !important",
            display: 'flex',
            alignItems: 'center',
        },
        customizeAppBar: {
            backgroundColor: theme.palette.header.main,
            boxShadow: "none",
            borderRadius: "8px",
            overflow: "hidden",
            maxWidth: "95%",
            margin: "16px auto",
        },
        customizeQuitButton: {
            backgroundColor: theme.palette.error.main,
            color: theme.palette.error.contrastText,
            fontSize: '0.8rem',
            "&:hover": {
                backgroundColor: theme.palette.error.dark,
            },
            display: 'flex',
            alignItems: 'center',
        },
        customizeDeleteButton: {
            backgroundColor: theme.palette.grey[300],
            color: theme.palette.grey[700],
            fontSize: '0.8rem',
            marginRight: 1,
            "&:hover": {
                backgroundColor: theme.palette.grey[400],
            },
            display: 'flex',
            alignItems: 'center',
        },
    };

    return (
        <AppBar position="relative" sx={style.customizeAppBar}>
            <Toolbar sx={style.customizeToolbar}>
                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontSize: '0.9rem', marginRight: 1 }}>
                        {process.env.REACT_APP_TITLE}
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '0.9rem', marginLeft: 2 }}>
                        {`${onlineServiceCount}/${totalServices} online`}
                    </Typography>
                </Box>
                <DeleteOutlineIcon 
                    sx={{ 
                        fontSize: '1.2rem', 
                        marginRight: 2,
                        color: autoriseServiceDelete ? theme.palette.error.main : theme.palette.grey[500],
                        cursor: 'pointer',
                        '&:hover': {
                            color: autoriseServiceDelete ? theme.palette.error.dark : theme.palette.grey[700]
                        }
                    }}
                    onClick={handleDeleteClick}
                />
                <Button
                    sx={style.customizeQuitButton}
                    color="inherit"
                    onClick={logout}
                >
                    <RocketLaunchIcon style={{ marginRight: 4, fontSize: '1rem' }} />
                    Disconnect
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
