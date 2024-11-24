import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';
import ServiceModal from './ServiceModal';

function Footer() {
    const [hover, setHover] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const handleOpen = () => setModalOpen(true);
    const handleClose = () => setModalOpen(false);

    return (
        <div style={{ position: 'fixed', bottom: 0, right: 0, padding: '16px', overflow: 'hidden' }}>
            <Button 
                variant="contained" 
                color="primary" 
                style={{ 
                    borderRadius: hover ? '20px' : '50%', 
                    minWidth: 0, 
                    width: hover ? 150 : 56, 
                    height: 56, 
                    transition: 'width 0.3s ease, border-radius 0.3s ease', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: hover ? 'flex-start' : 'center', 
                    paddingLeft: hover ? 16 : 0, 
                    paddingRight: hover ? 16 : 0, 
                }}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                onClick={handleOpen}
            >
                <AddIcon />
                {hover && <span style={{ marginLeft: 8 }}>Add a Service</span>}
            </Button>
            <ServiceModal open={modalOpen} handleClose={handleClose} />
        </div>
    );
}

export default Footer;
