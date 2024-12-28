import { useState, useEffect } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { useLocation } from 'react-router-dom';

const MessageAlert = () => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const location = useLocation();

    useEffect(() => {
        if (location.state?.message) {
            setMessage(location.state.message);
            setOpen(true);
            // Clean up the message from location state
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    return (
        <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
            <Alert onClose={handleClose} severity="warning" sx={{ width: '100%' }}>
                {message}
            </Alert>
        </Snackbar>
    );
};

export default MessageAlert; 