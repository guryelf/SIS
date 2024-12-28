import { useState } from 'react';
import { 
    Drawer, 
    List, 
    ListItem, 
    ListItemIcon, 
    ListItemText, 
    IconButton,
    Box,
    AppBar,
    Toolbar,
    Typography,
    Divider
} from '@mui/material';
import {
    Menu as MenuIcon,
    Home as HomeIcon,
    Login as LoginIcon,
    Logout as LogoutIcon,
    Schedule as ScheduleIcon,
    PersonAdd as PersonAddIcon,
    Edit as EditIcon,
    ViewList as ViewListIcon,
    CalendarMonth as CalendarIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Sidebar = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const isAuthenticated = !!Cookies.get('token');
    const user = JSON.parse(Cookies.get('user') || 'null');

    const handleLogout = () => {
        Cookies.remove('token');
        Cookies.remove('user');
        navigate('/', { 
            state: { message: 'You have been successfully logged out.' }
        });
        setOpen(false);
    };

    const handleBack = () => {
        navigate(-1);
        setOpen(false);
    };

    // Anonymous user menu items
    const anonymousMenuItems = [
        { text: 'Back', icon: <ArrowBackIcon />, action: handleBack },
        { text: 'Main Menu', icon: <HomeIcon />, path: '/' },
        { text: 'Login', icon: <LoginIcon />, path: '/login' },
        { text: 'View Department Course Schedule', icon: <CalendarIcon />, path: '/course-schedule' }
    ];

    // Student menu items
    const studentMenuItems = [
        { text: 'Back', icon: <ArrowBackIcon />, action: handleBack },
        { text: 'Main Menu', icon: <HomeIcon />, path: '/' },
        { text: 'View Department Course Schedule', icon: <CalendarIcon />, path: '/course-schedule' },
        { 
            header: 'Student Features',
            items: [
                { text: 'My Course Schedule', icon: <ScheduleIcon />, path: '/my-schedule' },
                { text: 'Add/Remove Courses', icon: <EditIcon />, path: '/manage-courses' }
            ]
        }
    ];

    // Secretary menu items
    const secretaryMenuItems = [
        { text: 'Back', icon: <ArrowBackIcon />, action: handleBack },
        { text: 'Main Menu', icon: <HomeIcon />, path: '/' },
        { text: 'View Department Course Schedule', icon: <CalendarIcon />, path: '/course-schedule' },
        {
            header: 'Department Secretary Features',
            items: [
                { text: 'Add/Remove Students', icon: <PersonAddIcon />, path: '/manage-students' },
                { text: 'Manage Course Schedule', icon: <ViewListIcon />, path: '/manage-department-courses' }
            ]
        }
    ];

    // Select menu items based on authentication status and role
    let menuItems = isAuthenticated 
        ? (user?.role === 'secretary' || user?.role === 'department_secretary' 
            ? [...secretaryMenuItems] 
            : [...studentMenuItems])
        : [...anonymousMenuItems];

    // Add logout button at the end for authenticated users
    if (isAuthenticated) {
        menuItems.push({ text: 'Logout', icon: <LogoutIcon />, action: handleLogout });
    }

    const handleItemClick = (item) => {
        if (item.action) {
            item.action();
        } else if (item.path) {
            navigate(item.path);
            setOpen(false);
        }
    };

    return (
        <>
            <AppBar 
                position="fixed" 
                sx={{ 
                    backgroundColor: 'white',
                    boxShadow: 1,
                    zIndex: (theme) => theme.zIndex.drawer + 1
                }}
            >
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="primary"
                        aria-label="menu"
                        onClick={() => setOpen(true)}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" color="primary" component="div">
                        Student Information System
                    </Typography>
                </Toolbar>
            </AppBar>
            <Toolbar />
            <Drawer
                anchor="left"
                open={open}
                onClose={() => setOpen(false)}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: 280,
                        boxSizing: 'border-box',
                        mt: '64px',
                        pt: 2,
                        display: 'flex',
                        flexDirection: 'column'
                    },
                }}
            >
                <Box
                    role="presentation"
                    sx={{ 
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <List sx={{ flexGrow: 1 }}>
                        {menuItems.map((item, index) => (
                            item.header ? (
                                <Box key={item.header}>
                                    <Divider sx={{ mt: 2, mb: 1 }} />
                                    <Typography
                                        variant="subtitle2"
                                        sx={{ px: 2, py: 1, color: 'text.secondary' }}
                                    >
                                        {item.header}
                                    </Typography>
                                    {item.items.map((subItem) => (
                                        <ListItem
                                            button
                                            key={subItem.text}
                                            onClick={() => handleItemClick(subItem)}
                                            sx={{
                                                pl: 3,
                                                py: 1,
                                                '&:hover': {
                                                    backgroundColor: 'rgba(25, 118, 210, 0.08)'
                                                }
                                            }}
                                        >
                                            <ListItemIcon sx={{ color: 'primary.main' }}>
                                                {subItem.icon}
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary={subItem.text}
                                                primaryTypographyProps={{
                                                    fontSize: '0.9rem'
                                                }}
                                            />
                                        </ListItem>
                                    ))}
                                </Box>
                            ) : (
                                <ListItem
                                    button
                                    key={item.text}
                                    onClick={() => handleItemClick(item)}
                                    sx={{
                                        py: 1,
                                        '&:hover': {
                                            backgroundColor: 'rgba(25, 118, 210, 0.08)'
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{ color: 'primary.main' }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={item.text}
                                        primaryTypographyProps={{
                                            fontSize: '1rem',
                                            fontWeight: 500
                                        }}
                                    />
                                </ListItem>
                            )
                        ))}
                    </List>
                </Box>
            </Drawer>
        </>
    );
};

export default Sidebar; 