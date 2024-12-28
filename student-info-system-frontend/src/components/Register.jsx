import { useState, useEffect } from 'react';
import { 
    Button, 
    Container, 
    Typography, 
    Box, 
    Alert,
    Paper,
    Divider,
    List,
    ListItem,
    ListItemText,
    CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from './Layout/Layout';

const Register = () => {
    const [departments, setDepartments] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:3000/api/departments');
                console.log('Departments response:', response.data); // Debug log
                setDepartments(response.data);
                setError('');
            } catch (error) {
                console.error('Error fetching departments:', error); // Debug log
                setError('Failed to load department information');
            } finally {
                setLoading(false);
            }
        };

        fetchDepartments();
    }, []);

    return (
        <Layout>
            <Container component="main" maxWidth="md">
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Typography component="h1" variant="h4" gutterBottom>
                        Student Registration Information
                    </Typography>
                    
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
                        To register as a student, please contact your department secretary. 
                        They will create your account and provide you with login credentials.
                    </Typography>

                    <Paper elevation={3} sx={{ width: '100%', p: 3, mb: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Department Secretary Contact Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                <CircularProgress />
                            </Box>
                        ) : error ? (
                            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                        ) : departments.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" textAlign="center">
                                No department information available
                            </Typography>
                        ) : (
                            <List>
                                {departments.map((dept) => (
                                    <ListItem key={dept._id} sx={{ flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
                                        <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold' }}>
                                            {dept.name}
                                        </Typography>
                                        <Box sx={{ mt: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Office: {dept.officeNumber}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Phone: {dept.officePhone}
                                            </Typography>
                                        </Box>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Paper>

                    <Button
                        variant="contained"
                        onClick={() => navigate('/login')}
                        sx={{ mt: 2 }}
                    >
                        Go to Login
                    </Button>
                </Box>
            </Container>
        </Layout>
    );
};

export default Register; 