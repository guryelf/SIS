import { useState } from 'react';
import { 
    TextField, 
    Button, 
    Container, 
    Typography, 
    Box, 
    Alert,
    Grid,
    Paper,
    Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import Layout from './Layout/Layout';

const LoginSection = ({ title, formData, handleChange, handleSubmit, error }) => (
    <Box sx={{ p: 3 }}>
        <Typography component="h2" variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
            {title}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
                margin="normal"
                required
                fullWidth
                id="idNumber"
                label="ID Number"
                name="idNumber"
                autoComplete="off"
                value={formData.idNumber}
                onChange={handleChange}
            />
            <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
            />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3 }}
            >
                Sign In
            </Button>
        </Box>
    </Box>
);

const Login = () => {
    const [studentForm, setStudentForm] = useState({ idNumber: '', password: '' });
    const [secretaryForm, setSecretaryForm] = useState({ idNumber: '', password: '' });
    const [studentError, setStudentError] = useState('');
    const [secretaryError, setSecretaryError] = useState('');
    const navigate = useNavigate();

    const handleStudentSubmit = async (e) => {
        e.preventDefault();
        setStudentError('');
        try {
            const response = await axios.post('http://localhost:3000/api/auth/login', {
                ...studentForm,
                role: 'student'
            });

            if (response.data.token) {
                Cookies.set('token', response.data.token);
                Cookies.set('user', JSON.stringify(response.data));
                navigate('/', { 
                    state: { message: 'Successfully logged in!' },
                    replace: true
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            setStudentError(error.response?.data?.message || 'Failed to login. Please try again.');
        }
    };

    const handleSecretarySubmit = async (e) => {
        e.preventDefault();
        setSecretaryError('');
        try {
            const response = await axios.post('http://localhost:3000/api/auth/login', {
                ...secretaryForm,
                role: 'department_secretary'
            });

            if (response.data.token) {
                Cookies.set('token', response.data.token);
                Cookies.set('user', JSON.stringify(response.data));
                navigate('/', { 
                    state: { message: 'Successfully logged in!' },
                    replace: true
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            setSecretaryError(error.response?.data?.message || 'Failed to login. Please try again.');
        }
    };

    return (
        <Layout>
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <Typography 
                        component="h1" 
                        variant="h4" 
                        align="center" 
                        gutterBottom
                        sx={{ mb: 4, color: 'primary.main' }}
                    >
                        Login
                    </Typography>
                    
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <LoginSection
                                title="Student Login"
                                formData={studentForm}
                                handleChange={(e) => setStudentForm({
                                    ...studentForm,
                                    [e.target.name]: e.target.value
                                })}
                                handleSubmit={handleStudentSubmit}
                                error={studentError}
                            />
                        </Grid>

                        <Grid item xs={12} md={6} sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            position: 'relative' 
                        }}>
                            <Divider 
                                orientation="vertical" 
                                sx={{ 
                                    position: 'absolute', 
                                    left: -2, 
                                    top: 0, 
                                    bottom: 0,
                                    display: { xs: 'none', md: 'block' }
                                }} 
                            />
                            <LoginSection
                                title="Department Secretary Login"
                                formData={secretaryForm}
                                handleChange={(e) => setSecretaryForm({
                                    ...secretaryForm,
                                    [e.target.name]: e.target.value
                                })}
                                handleSubmit={handleSecretarySubmit}
                                error={secretaryError}
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Divider sx={{ mb: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                New Student?
                            </Typography>
                        </Divider>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/register')}
                            sx={{ minWidth: 200 }}
                        >
                            View Registration Information
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Layout>
    );
};

export default Login; 