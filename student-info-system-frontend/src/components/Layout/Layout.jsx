import { Box } from '@mui/material';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <Box sx={{ 
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pt: { xs: 2, sm: 4 },
            px: { xs: 2, sm: 4 }
        }}>
            <Sidebar />
            <Box sx={{ 
                width: '100%',
                maxWidth: 1200,
                mx: 'auto',
                position: 'relative',
                zIndex: 1
            }}>
                {children}
            </Box>
        </Box>
    );
};

export default Layout; 