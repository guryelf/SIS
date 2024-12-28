import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Alert, Snackbar } from '@mui/material';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const user = JSON.parse(Cookies.get('user') || 'null');
    const isAuthenticated = !!Cookies.get('token');

    // If no authentication is required (public routes)
    if (allowedRoles.length === 0) {
        return children;
    }

    // If authentication is required but user is not logged in
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ message: "You must be logged in to view this page." }} />;
    }

    // If user is authenticated but doesn't have the required role
    if (!allowedRoles.includes(user?.role)) {
        return <Navigate to="/" state={{ message: "You don't have permission to access this page." }} />;
    }

    // If all checks pass, render the protected component
    return children;
};

export default ProtectedRoute; 