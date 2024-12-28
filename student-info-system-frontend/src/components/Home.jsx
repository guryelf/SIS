import { Typography, Container, Paper, Grid, Box, IconButton, Tooltip } from '@mui/material';
import {
    Login as LoginIcon,
    CalendarMonth as CalendarIcon,
    Schedule as ScheduleIcon,
    Edit as EditIcon,
    PersonAdd as PersonAddIcon,
    ViewList as ViewListIcon,
    Logout as LogoutIcon,
    Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Layout from './Layout/Layout';

const MenuIcon = ({ icon, title, onClick, disabled = false }) => (
    <Tooltip title={disabled ? "Login required to access this feature" : title}>
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: disabled ? 'none' : 'scale(1.05)',
                },
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
                width: 160,
                height: 140
            }}
            onClick={(e) => {
                if (!disabled) {
                    onClick(e);
                }
            }}
        >
            <IconButton
                sx={{
                    width: 80,
                    height: 80,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                        backgroundColor: disabled ? 'primary.main' : 'primary.dark',
                    },
                    '&.Mui-disabled': {
                        backgroundColor: 'primary.main',
                        opacity: 0.5
                    }
                }}
                disabled={disabled}
            >
                {icon}
            </IconButton>
            <Typography
                variant="subtitle1"
                align="center"
                sx={{
                    width: '100%',
                    fontSize: '0.9rem',
                    lineHeight: 1.2,
                    height: '2.4rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}
            >
                {title}
            </Typography>
        </Box>
    </Tooltip>
);

const Home = () => {
    const navigate = useNavigate();
    const user = JSON.parse(Cookies.get('user') || 'null');
    const isAuthenticated = !!Cookies.get('token');

    const handleLogout = () => {
        Cookies.remove('token');
        Cookies.remove('user');
        navigate('/', { 
            state: { message: 'You have been successfully logged out.' }
        });
    };

    // Anonymous user menu items
    const anonymousMenuItems = [
        {
            icon: <LoginIcon sx={{ fontSize: 40 }} />,
            title: 'Student/Department Secretary Login',
            path: '/login',
            public: true
        },
        {
            icon: <CalendarIcon sx={{ fontSize: 40 }} />,
            title: 'View Department Course Schedule',
            path: '/course-schedule',
            public: true
        }
    ];

    // Authenticated user menu items
    const authenticatedMenuItems = [
        {
            icon: <CalendarIcon sx={{ fontSize: 40 }} />,
            title: 'View Department Course Schedule',
            path: '/course-schedule',
            public: true
        }
    ];

    // Add student-specific menu items
    if (user?.role === 'student') {
        authenticatedMenuItems.push(
            {
                icon: <ScheduleIcon sx={{ fontSize: 40 }} />,
                title: 'View My Course Schedule',
                path: '/my-schedule'
            },
            {
                icon: <EditIcon sx={{ fontSize: 40 }} />,
                title: 'Add/Remove Courses',
                path: '/manage-courses'
            }
        );
    }

    // Add secretary-specific menu items
    if (user?.role === 'department_secretary') {
        authenticatedMenuItems.push(
            {
                icon: <PersonAddIcon sx={{ fontSize: 40 }} />,
                title: 'Add/Remove Students',
                path: '/manage-students'
            },
            {
                icon: <ViewListIcon sx={{ fontSize: 40 }} />,
                title: 'Manage Department Schedule',
                path: '/manage-department-courses'
            }
        );
    }

    // Add logout for authenticated users
    if (isAuthenticated) {
        authenticatedMenuItems.push({
            icon: <LogoutIcon sx={{ fontSize: 40 }} />,
            title: 'Logout',
            action: handleLogout,
            public: true
        });
    }

    const menuItems = isAuthenticated ? authenticatedMenuItems : anonymousMenuItems;

    const handleItemClick = (item) => {
        if (item.action) {
            item.action();
        } else {
            navigate(item.path);
        }
    };

    return (
        <Layout>
            <Box 
                sx={{ 
                    minHeight: 'calc(100vh - 64px)', // Account for AppBar height
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2
                }}
            >
                <Paper 
                    elevation={3} 
                    sx={{ 
                        p: 6,
                        backgroundColor: 'white',
                        borderRadius: 2,
                        width: '100%',
                        maxWidth: '800px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4
                    }}
                >
                    <Typography 
                        variant="h3" 
                        component="h1" 
                        sx={{ 
                            color: '#1976d2',
                            textAlign: 'center',
                            fontWeight: 'bold'
                        }}
                    >
                        Student Information System
                    </Typography>

                    {isAuthenticated && (
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                textAlign: 'center',
                                color: 'text.secondary'
                            }}
                        >
                            Welcome, {user?.name}
                        </Typography>
                    )}

                    <Grid 
                        container 
                        spacing={4}
                        justifyContent="center"
                        alignItems="center"
                        sx={{ 
                            maxWidth: isAuthenticated ? '700px' : '500px'
                        }}
                    >
                        {menuItems.map((item, index) => (
                            <Grid 
                                item 
                                key={index}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center'
                                }}
                            >
                                <MenuIcon
                                    icon={item.icon}
                                    title={item.title}
                                    onClick={() => handleItemClick(item)}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            </Box>
        </Layout>
    );
};

export default Home; 