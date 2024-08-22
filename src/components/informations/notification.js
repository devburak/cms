import React,{useState,useEffect} from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Notification = ({ open=false, message, severity, onClose, autoHideDuration = 6000 }) => {
      // Eğer onClose prop'u tanımlı değilse, kendimiz bir kapatma işlevi yaratıyoruz
    const [localOpen, setLocalOpen] = useState(open);

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setLocalOpen(false);
        if (onClose) onClose(event, reason);
    };
    useEffect(() => {
        // Eğer open prop'u değişirse, yerel state'i güncelleriz
        setLocalOpen(open);
    }, [open]);
    return (
        <Snackbar
            open={localOpen}
            autoHideDuration={autoHideDuration || 6000}
            onClose={handleClose} // Eğer onClose tanımlı değilse, kendi handleClose işlevimiz kullanılacak
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
            <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
                {message}
            </Alert>
        </Snackbar>
    );
};

export default Notification;
